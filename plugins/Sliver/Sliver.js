const PLUGIN_NAME = "Sliver";

const fs = require('fs');
const path = require('path');
const protoBuf = require("protobufjs");
const tls = require('tls');

const Listen = require('../lib/listen');
const Listener = require('../objects/listener');


class mTLS extends Listener {
    constructor() {
        super('mtls', {});
        this.commonpb = this.loadProto('commonpb', 'common.proto').commonpb;
        this.sliverpb = this.loadProto('sliverpb', 'sliver.proto').sliverpb;
        this.executors = this.generateExecutors();
        this.mtls_port = 8888;
    }
    init() {
        return new Promise((resolve, reject) => {
            this.destroy().then(() => {
                let self = this;
                const sockets = new Set();
                const opts = {
                    cert: fs.readFileSync(path.join(Settings.appUserDir(), 'plugins', 'Sliver', 'certs', 'mtls-server-ca-cert.pem')),
                    key: fs.readFileSync(path.join(Settings.appUserDir(), 'plugins', 'Sliver', 'certs', 'mtls-server-ca-key.pem')),
                    requestCert: true,
                    rejectUnauthorized: true,
                    ca: fs.readFileSync(path.join(Settings.appUserDir(), 'plugins', 'Sliver', 'certs', 'mtls-implant-ca-cert.pem'))
                };
                this.listening.mtls = tls.createServer(opts, (socket) => {
                    sockets.add(socket);
                    console.log('server connected', socket.authorized ? 'authorized' : 'unauthorized');

                    socket.agent = new Promise((resolve, reject) => {
                        socket.agent_resolve = resolve;
                    });

                    let size = 0;
                    let envelope;
                    let operatorAgent = null;
                    let sliverAgent = null;
                    let beacon;
                    let links;
                    socket.on('data', (data) => {
                        if (data.length === 4) {
                            size = self.getSocketBeaconSize(data);
                        } else {
                            envelope = self.sliverpb.Envelope.decode(data);
                            if (envelope.Type === 0) {
                                let resp = links.results(envelope.Data);
                                beacon = self.mapBeaconProperties(resp, operatorAgent);
                                links.Response = JSON.stringify(resp, null, 2);
                                links.Status = 0;
                                links.Pid = sliverAgent.Pid;
                                beacon.links.push(links);
                                operatorAgent.handle(beacon);
                            } else if (envelope.Type === 1) {
                                sliverAgent = self.sliverpb.Register.decode(envelope.Data);
                                beacon = self.mapBeaconProperties(sliverAgent, operatorAgent);
                                Agent.findAgent(beacon.name).then(agent => {
                                    socket.agent_resolve(agent);
                                    agent.socket = socket;

                                    agent.closeConnection = () => {
                                        socket.end();
                                    }

                                    agent.handler = {
                                        name: 'mTLS', active: true, function: (o) => {
                                            links = JSON.parse(o).links[0];
                                            links['results'] = self.executors.ls.resp;
                                            let env = self.sliverpb.Envelope.create({
                                                Type: self.executors.ls.type,
                                                Data: self.sliverpb.LsReq.encode(self.executors.ls.req()).finish()
                                            });
                                            let test = self.sliverpb.Envelope.encode(env).finish();
                                            socket.write(Buffer.from(self.toBytesInt32(test.length)));
                                            socket.write(test);
                                        }
                                    };

                                    operatorAgent = agent;
                                    operatorAgent.handle(beacon);
                                });
                            } else if (envelope.Type === 3) {
                                beacon = self.mapBeaconProperties(self.sliverpb.Ping.decode(envelope.Data), operatorAgent);
                                operatorAgent.handle(beacon);
                                console.log(beacon);
                            } else {
                                console.log(envelope);
                            }
                        }
                    });

                    socket.on('error', (data) => {
                        console.log(data);
                    });

                    socket.on('close', function () {
                        sockets.delete(socket);
                        socket.agent.then((agent) => {
                            agent.state = Agent.StateEnum.offline;
                            Agent.dropSocket(socket);
                        });
                    });
                });
                this.listening.mtls_sockets = sockets;
                this.listening.mtls.listen(this.mtls_port, Settings.settings.local.server, ()=> {
                    console.log('Listening...')
                });
            });
        });
    }
    destroy() {
        return new Promise((resolve, reject) => {
            if (this.listening.mtls) {
                Promise.all([...this.listening.mtls_sockets].map((s) => new Promise((resolve, reject) => {
                    s.destroy();
                    resolve();
                }))).then(() => {
                    this.listening.mtls.close(() => {
                        delete this.listening.mtls_sockets;
                        delete this.listening.mtls;
                        resolve();
                    });
                }).catch((e) => {
                    reject(e);
                });
            } else {
                resolve();
            }
        });
    }
    loadProto(dir, proto) {
        const root = new protoBuf.Root();
        root.resolvePath = ((origin, target) => {
            return path.join(Settings.appUserDir(), 'plugins', 'Sliver', 'proto', target);
        })
        return root.loadSync(path.join(dir, proto)).root.nested;
    }
    generateExecutors() {
        const toObjOpts = {
            enums: String,
            longs: String,
            bytes: String,
            defaults: true,
            arrays: true,
            objects: true,
            oneofs: true
        }
        return {
            ls: {
                type: 5,
                req: (p) => this.sliverpb.LsReq.create({Path: p, Request: this.commonpb.Request.create({Timeout: 1000})}),
                resp: (d) => this.sliverpb.Ls.toObject(this.sliverpb.Ls.decode(d), toObjOpts)
            },
            pwd: {
                type: 12,
                req: () => this.sliverpb.PwdReq.create({Request: this.commonpb.Request.create({Timeout: 1000})}),
                resp: (d) => this.sliverpb.Pwd.toObject(this.sliverpb.Pwd.decode(d), toObjOpts)
            }
        }
    }
    mapBeaconProperties(register, agent){
        return {
            name: register?.Name || agent.name,
            target: register.ActiveC2 || agent.target,
            location: register.Filename || agent.location,
            platform: register.Os || agent.platform,
            executors: Object.keys(this.executors),
            range: 'Sliver',
            sleep: 0,
            links: [],
            encryptor: 'plaintext',
            key: ''
        }
    }
    getSocketBeaconSize(data) {
        let buf = Buffer.from(data);
        let ab = new ArrayBuffer(buf.length);
        let view = new Uint8Array(ab);
        for (let i = 0; i < buf.length; ++i) {
            view[i] = buf[i];
        }
        return new DataView(ab).getInt32(0, true);
    }
    toBytesInt32 (num) {
        let arr = new ArrayBuffer(4); // an Int32 takes 4 bytes
        let view = new DataView(arr);
        view.setUint32(0, num, true); // byteOffset = 0; litteEndian = false
        return arr;
    }
}

const cleanupListeners = (topics) => {
    topics.map(topic => Events.bus.listeners(topic).map(listener => {
        if (listener[`${PLUGIN_NAME}_LISTENER`]) {
            Events.bus.off(topic, listener);
        }
    }));
};

cleanupListeners(['plugin:config', 'plugin:delete']);

Events.bus.on('plugin:config', Object.assign((name, config) => {
    if (name === PLUGIN_NAME) {
        Listen.listeners.add(mTLS);
    }
}, {[`${PLUGIN_NAME}_LISTENER`]: true}));

Events.bus.on('plugin:delete', Object.assign((name) => {
    if (name === PLUGIN_NAME) {
        cleanupListeners(['plugin:config', 'plugin:delete']);
    }
}, {[`${PLUGIN_NAME}_LISTENER`]: true}));

try{
    Listen.listeners.add(mTLS);
} catch(e) {
    console.log(e)
}