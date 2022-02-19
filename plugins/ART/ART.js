const initFacts = () => {
  return Promise.all([
    Requests.fetchOperator('/v1/plugin/ART').then(res => res.json()),
    Requests.fetchOperator('/v1/agents').then(res => res.json())
  ]).then(([res, agents]) => {
    if (res.facts){
      Object.keys(res.facts).forEach(name => {
        let temp = res.facts[name];
        res.facts[name] = temp;
      })
      return Requests.fetchOperator(`/v1/agent/${agents[0].name}/facts`, {
        method: 'POST',
        body: JSON.stringify({
          name: 'art',
          facts: Object.entries(res.facts).map(([key, value]) => ({
            key: key, value: value, scope: 'global'
          }))
        })
      });
    }
  });
};

const fetchTTPs = () => {
  return Promise.resolve(Requests.hq.getAttackSchema().catch(err => ({})))
    .then(schema => Object.entries(schema).reduce((acc, [tactic, techniques]) =>
      Object.keys(techniques).reduce((acc, technique) => ({
        ...acc,
        [technique]: tactic
      }), acc), {}))
    .then(schema => {
      const yaml = Basic.require('js-yaml');
      const facts = {};
      return fetch(`https://api.github.com/repos/redcanaryco/atomic-red-team/git/trees/master?recursive=3`)
        .then(res => res.json())
        .then(res => {
          return Promise.all(res.tree.filter(el => el.path.endsWith('.yml') || el.path.endsWith('.yaml'))
            .map(file => {
              return fetch(`https://raw.githubusercontent.com/redcanaryco/atomic-red-team/master/${file.path}`)
                .then(res => res.text())
                .then(yaml.safeLoad)
                .then(res => {
                  return convertRedCanary(res, schema, facts);
                })
                .then(res => Promise.all(res.map(ttp => Requests.fetchOperator('/v1/ttps', {
                  method: 'POST',
                  body: JSON.stringify(ttp)
                }))))
                .catch(err => null);
            }));
        })
        .then(() => {
          return Requests.fetchOperator('/v1/plugin/ART', {
            method: 'GET'
          }).then(res => res.json()).then(res => {
            res['facts'] = Object.assign({}, res.facts, facts);
            Requests.fetchOperator('/v1/plugin/ART', {
              method: 'POST',
              body: JSON.stringify(res)
            }).then(initFacts)
          });
        })
        .then(() => {
          Events.bus.emit('chat:message', `Your ART TTPs are now accessible.`);
        });
    });
};

Requests.fetchOperator('/v1/ttps')
  .then(res => res.json())
  .then(res => {
    const ttps = Object.values(res).filter(r => r?.metadata?.source === 'Red Canary');
    if (!ttps.length) {
      return fetchTTPs();
    }
  }).then(initFacts);

function convertRedCanary(data, schema, facts) {
  return new Promise((resolve, reject) => {
    try {
      let procedures = [];
      data.atomic_tests.forEach((ttp, idx) => {
        let atk = {
          id: ttp.auto_generated_guid,
          name: ttp.name,
          description: ttp.description,
          metadata: {version: 1, authors: ['Atomic Red Team'], tags: ['ART'], source: 'Red Canary'},
          tactic: schema[data.attack_technique] || 'ART',
          technique: {id: data.attack_technique, name: data.display_name},
          platforms: {}
        };
        const replacements = Object.keys(ttp?.input_arguments || {}).map(arg => {
          const key = `${data.attack_technique}.${idx}.${arg}`
          facts[key] = ttp.input_arguments[arg].default;
          return [`#{${arg}}`, `#{${key}}`];
        });
        ttp.supported_platforms.forEach(p => {
          const platform = normalize(p);
          const executor = normalize(ttp.executor.name)
          atk.platforms[platform] = atk.platforms[platform] || {};
          atk.platforms[platform][executor] = {
            command: escapeTtpCommand(executor, ttp.executor.command ? ttp.executor.command : ttp.executor.steps, replacements)
          };
        });
        procedures.push(atk);
      });
      resolve(procedures);
    } catch (e) {
      reject()
    }
  });
}

function normalize(n) {
  const mapper = {macos: 'darwin', command_prompt: 'cmd', powershell: 'psh'};
  return mapper.hasOwnProperty(n) ? mapper[n] : n;
}

const escapeTtpCommand = function(executor, command, replacements) {
  const DELIMITERS = {
    "psh": ";\n",
    "pwsh": ";\n",
    "cmd": " &\n",
    "sh": ";\n",
    "bash": ";\n",
    "python": "\n",
    "manual": ";\n"
  };
  const CONTINUATIONS = {
    "psh": [new RegExp(`^#(?!{)`), new RegExp(`[\`\\{\\};]\\s*$`)],
    "pwsh": [new RegExp(`^#(?!{)`), new RegExp(`[\`\\{\\};]\\s*$`)],
    "cmd": [new RegExp(`[\\^&]\\s*$`)],
    "sh": [new RegExp(`^#(?!{)`), new RegExp(`[\\\\;]\\s*$`), new RegExp(`\\bthen\\s*$`)],
    "bash": [new RegExp(`^#(?!{)`), new RegExp(`[\\\\;]\\s*$`), new RegExp(`\\bthen\\s*$`)],
    "python": [],
    "manual": []
  };
  command = replacements.reduce((command, [match, replacement]) =>
    command.replaceAll(match, replacement), command).replaceAll(/#{([a-zA-Z0-9_\.\|]+)}/g, "#{art.$1}");
  return command.trim().split('\n').reduce((acc, part, idx) => {
    if (!idx || CONTINUATIONS[executor].filter(r => r.exec(acc.trim())).length) {
      return acc + (idx ? "\n" : "") + part;
    } else {
      return acc + DELIMITERS[executor] + part;
    }
  }, '');
};

const cleanupListeners = () => {
  Events.bus.listeners('plugin:delete').map(listener => {
    if (listener.ART_PLUGIN_LISTENER) {
      Events.bus.off('plugin:delete', listener);
    }
  });
};

Events.bus.on('plugin:delete', Object.assign((name) => {
  if (name === 'ART') {
    Requests.fetchOperator('/v1/ttps')
      .then(res => res.json())
      .then(res => {
        const ttps = Object.values(res).filter(r => r?.metadata?.source === 'Red Canary');
        return Promise.all(ttps.map(ttp =>
          Requests.fetchOperator(`/v1/ttps/${ttp.id}`, {
            method: 'DELETE'
          })))
      })
      .then(res => {
        Events.bus.emit('chat:message', `All Atomic Red Team TTPs have been deleted from your workspace. Please restart Operator in order to remove all ART facts`);
      });
    cleanupListeners();
  }
}, {
  ART_PLUGIN_LISTENER: true
}));