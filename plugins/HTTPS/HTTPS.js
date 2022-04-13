const Encryption = require('../lib/encryption');
const Events = require('../lib/events');
const Listen = require('../lib/listen');
const HTTP = require('../objects/listeners/http');

class HTTPS extends HTTP {
    constructor() {
        super('https', 8443);
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

Events.bus.on('plugin:delete', Object.assign((name) => {
    if (name === 'HTTPS') {
        const listener = Listen.listeners.protocols.splice(Listen.listeners.protocols.findIndex(e => e.name === 'https'), 1);
        listener[0].destroy();
        Events.bus.listeners('plugin:delete').map(listener => {
            if (listener.HTTPS_LISTENER) {
                Events.bus.off('plugin:delete', listener);
            }
        });
    }
}, {HTTPS_LISTENER: true}));