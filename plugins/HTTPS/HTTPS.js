const Encryption = require('../lib/encryption');
const Events = require('../lib/events');
const Listen = require('../lib/listen');
const HTTP = require('../objects/listeners/http');
const Settings = require('../objects/settings');

class HTTPS extends HTTP {
    constructor() {
        super('https', 8443);
        Settings.s.public.ports[this.name] = Settings.s.public.ports[this.name] || this.port;
    }
    init() {
        return new Promise((resolve, reject) => {
            this.destroy().then(() => {
                const cert = Encryption.loadCertificates();
                const server = require('https').createServer({
                   key: cert.key,
                   cert: cert.cert
                }, this.buildExpressApp())
                this.listening = server.listen(this.port, this.server, () => {
                    Events.bus.emit('chat:message', `Attached HTTPS listener on ${this.port}.`);
                });
                resolve();
            }).catch(e => {
                reject(e)
            });
        })
    }
    renderTarget(address=null) {
        return `https://${address || this.server}:${this.port}`;
    }
}

Listen.listeners.add(new HTTPS());

Events.bus.on('destroy:resource', Object.assign((resource, identifier) => {
    if (resource == 'plugin' && identifier === 'HTTPS') {
        const listener = Listen.listeners.protocols.splice(Listen.listeners.protocols.findIndex(e => e.name === 'https'), 1);
        listener[0].destroy();
        delete Settings.s.public.ports.https;
        Events.bus.listeners('destroy:resource').map(listener => {
            if (listener.HTTPS_LISTENER) {
                Events.bus.off('destroy:resource', listener);
            }
        });
    }
}, {HTTPS_LISTENER: true}));