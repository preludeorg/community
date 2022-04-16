const fetchOperator = (endpoint, options) => fetch(`https://${Settings.s.public.server}:${Settings.s.public.api}${endpoint}`, {
            method: options?.method || 'GET',
            body: options?.body || '',
            headers: {
                ...options?.headers,
                authorization: Settings.s.public.token
            }
        });
const fetchGetOperatorTTPs = () => fetchOperator('/v1/ttp').then(res => res.json());
const fetchDeleteARTTTP = (ttp) => fetchOperator(`/v1/ttp/${ttp.id}`, {method: 'DELETE'});
const batchFetchTTPs = (ttps, callback, batchSize=20, batchTimeout=250) => {
  const chunks = Array(Math.ceil(ttps.length / batchSize)).fill().map((n, idx) => ttps.slice(idx * batchSize, idx * batchSize + batchSize));
  return new Promise((resolve, reject) => {
    let idx = 0;
    const next = () => {
      if (idx < chunks.length) {
        Promise.all(chunks[idx++].map(ttp => callback(ttp)))
            .then(() => setTimeout(next, batchTimeout), reject)
      } else {
        resolve();
      }
    }
    next();
  });
}

Events.bus.on('plugin:delete', Object.assign((name) => {
  if (name === 'ART') {
    Requests.hq.deleteOutpost({name: 'ART'})
        .then(() => {
            fetchGetOperatorTTPs().then(ttps =>
                Promise.resolve(batchFetchTTPs(Object.values(ttps).filter(r => r?.metadata?.source === 'Red Canary'), fetchDeleteARTTTP))
            ).then(() => Events.bus.emit('chat:message', `Detached the Atomic Red Team Outpost and removed TTPs`))
        })
    Events.bus.listeners('plugin:delete').map(listener => {
      if (listener.ART_PLUGIN_LISTENER) {
        Events.bus.off('plugin:delete', listener);
      }
    });
  }
}, {
  ART_PLUGIN_LISTENER: true
}));


Requests.hq.getOutposts()
  .then(outposts => {
    if (!outposts.find(t => t.name === 'ART')) {
      return Promise.resolve(Requests.hq.postOutpost({name: 'ART', address: 'https://redcanary.outposts-lateralus.prelude.org'}))
    }
  }).then(() => Events.bus.emit('chat:message', `Attached a the Atomic Red Team Outpost`));
