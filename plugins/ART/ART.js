const fetchARTRepoAllFiles = () => fetch(`https://api.github.com/repos/redcanaryco/atomic-red-team/git/trees/master?recursive=3`).then(res => res.json()).catch(console.log)
const fetchArtRepoFile = (file) => fetch(`https://raw.githubusercontent.com/redcanaryco/atomic-red-team/master/${file}`).then(res => res.text())
const fetchARTRepoIndexFile = () => fetchArtRepoFile('atomics/Indexes/index.yaml')
const fetchGetOperatorARTFacts = () => Requests.fetchOperator('/v1/plugin/ART').then(res => res.json());
const fetchUpdateOperatorARTFact = (facts) => fetchGetOperatorARTFacts().then(data => Requests.fetchOperator('/v1/plugin/ART', { method: 'POST', body: JSON.stringify(facts) }).then(res => res.json()));
const fetchGetOperatorTTPs = () => Requests.fetchOperator('/v1/ttp').then(res => res.json());
const fetchUpdateOperatorTTP = (ttp) => Requests.fetchOperator('/v1/ttp', { method: 'POST', body: JSON.stringify(ttp) }).then(res => res.json());
const fetchDeleteARTTTP = (ttp) => Requests.fetchOperator(`/v1/ttp/${ttp.id}`, {method: 'DELETE'});
const fetchHandleFacts = (facts, action='POST') => {
  return Requests.fetchOperator('/v1/agent').then(res => res.json()).then(agents =>
    Requests.fetchOperator(`/v1/agent/${agents[0].name}/facts`, {
      method: action,
      body: JSON.stringify(Object.entries(facts).filter(([key, value]) => key.startsWith('art.')).map(([key, value]) => ({
        key: key, value: value, scope: 'global'
      })))
    })
  );
};

const batchFetchTTPs = (ttps, callback, batchSize=20, batchTimeout=250) => {
  const chunks = Array(Math.ceil(ttps.length / batchSize)).fill().map((n, idx) => ttps.slice(idx * batchSize, idx * batchSize + batchSize));
  return new Promise((resolve, reject) => {
    let idx = 0;
    const next = () => {
      if (idx < chunks.length) {
        Promise.all(chunks[idx++].map(ttp => callback(ttp)))
            .then(() => {
              setTimeout(next, batchTimeout)
            }, reject)
      } else {
        resolve();
      }
    }
    next();
  });
}

const ingestAtomicRedTeamRepository = () => {
  const yaml = require('js-yaml');

  const createSchemaIndex = (index) => Object.entries(index).reduce((acc, [tactic, techniques]) =>
      Object.keys(techniques).reduce((acc, technique) => ({
        ...acc,
        [technique]: tactic
      }), acc), {});

  const resolveAllTTPFiles = (repoData, index) => {
    return new Promise((resolve, reject) => {
      const schema = createSchemaIndex(yaml.safeLoad(index));
      let preludeFormattedData = {procedures: [], facts: {}};
      Promise.all(repoData?.tree.filter(file => file.type === 'blob' && file.path.includes('.yaml'))
          .map(ttp => fetchArtRepoFile(ttp.path)
                        .then(fileData => {
                            let results = convertRedCanary(yaml.safeLoad(fileData), schema);
                            preludeFormattedData.procedures = preludeFormattedData.procedures.concat(results.procedures);
                            preludeFormattedData.facts = {...preludeFormattedData.facts, ...results.facts};
                          })
                        .catch(e => {})
      )).then(() =>
          Promise.all([
              fetchUpdateOperatorARTFact(preludeFormattedData.facts).then(facts => fetchHandleFacts(facts)),
              batchFetchTTPs(preludeFormattedData.procedures, fetchUpdateOperatorTTP)
          ])
      ).then(resolve).catch(reject)
    })
  }

  return Promise.all([fetchARTRepoAllFiles(), fetchARTRepoIndexFile()])
    .then(([data, index]) => resolveAllTTPFiles(data, index));
};

const convertRedCanary = (data, schema) => {

  const normalize = (n) => {
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
      command.replaceAll(match, replacement), command).replaceAll(/#{([a-zA-Z0-9_\.\|]+)}/g, "#{$1}");
    return command.trim().split('\n').reduce((acc, part, idx) => {
      if (!idx || CONTINUATIONS[executor].filter(r => r.exec(acc.trim())).length) {
        return acc + (idx ? "\n" : "") + part;
      } else {
        return acc + DELIMITERS[executor] + part;
      }
    }, '');
  };

  let redCanaryData = {procedures: [], facts: {}};
  try {
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
        const key = `art.${data.attack_technique}.${arg}`;
        redCanaryData.facts[key] = ttp.input_arguments[arg].default;
        return [`#{${arg}}`, `#{${key}}`];
      });
      ttp.supported_platforms.forEach(p => {
        const platform = normalize(p);
        const executor = normalize(ttp.executor.name);
        atk.platforms[platform] = atk.platforms[platform] || {};
        atk.platforms[platform][executor] = {
          command: escapeTtpCommand(executor, ttp.executor.command ? ttp.executor.command : ttp.executor.steps, replacements)
        };
      });
      if (atk.id) {
        redCanaryData.procedures.push(atk);
      }
    });
  } catch (e) {}
  return redCanaryData;
}

Events.bus.on('plugin:delete', Object.assign((name) => {
  if (name === 'ART') {
    Promise.all([fetchGetOperatorARTFacts().then(facts => fetchHandleFacts(facts, 'DELETE')),
    fetchGetOperatorTTPs()
    ]).then(([res, ttps]) => {
        const redCanaryTTPs = Object.values(ttps).filter(r => r?.metadata?.source === 'Red Canary');
        return Promise.resolve(batchFetchTTPs(redCanaryTTPs, fetchDeleteARTTTP))
      })
      .then(() => {
          Events.bus.emit('chat:message', `All Atomic Red Team TTPs and Facts have been deleted from your workspace.`);
      });
    Events.bus.listeners('plugin:delete').map(listener => {
      if (listener.ART_PLUGIN_LISTENER) {
        Events.bus.off('plugin:delete', listener);
      }
    });
  }
}, {
  ART_PLUGIN_LISTENER: true
}));


fetchGetOperatorTTPs()
  .then(res => {
    const ttps = Object.values(res).filter(r => r?.metadata?.source === 'Red Canary');
    if (!ttps.length) {
      return ingestAtomicRedTeamRepository();
    }
  }).then(() => Events.bus.emit('chat:message', `All Atomic Red Team TTPs and Facts have been added to your workspace`));