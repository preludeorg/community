const fs = require('fs');
const path = require('path');
const protoBuf = require("protobufjs");
const tls = require('tls');

const Basic = require('../lib/basic')
const Events = require('../lib/events');
const Listen = require('../lib/listen');
const Agent = require('../objects/agent');
const Listener = require('../objects/listener');
const Settings = require('../objects/settings');
const Workspace = require('../objects/workspace');


class mTLS extends Listener {
    constructor() {
        super('mtls', 8080);
        this.sliver = new Sliver();
        this.listening = {
            mtls: null,
            mtls_sockets: null
        };
        Settings.s.public.ports[this.name] = this.port;
    }
    init() {
        return new Promise((resolve, reject) => {
            this.destroy().then(() => {
                let self = this;
                const sockets = new Set();
                let opts = {};
                try {
                    opts = {
                        cert: fs.readFileSync(path.join(this.sliver.certificateDir, 'mtls-server-ca-cert.pem')),
                        key: fs.readFileSync(path.join(this.sliver.certificateDir, 'mtls-server-ca-key.pem')),
                        requestCert: true,
                        rejectUnauthorized: true,
                        ca: fs.readFileSync(path.join(this.sliver.certificateDir, 'mtls-implant-ca-cert.pem'))
                    };
                } catch (e) {
                    Events.bus.emit('chat:message', `Missing certificates to launch Sliver mTLS listener! Install to ${this.sliver.certificateDir}.`);
                    throw new Error(e);
                }
                this.listening.mtls = tls.createServer(opts, (socket) => {
                    sockets.add(socket);

                    socket.agent = new Promise((resolve, reject) => {
                        socket.agent_resolve = resolve;
                    });

                    let operatorAgent = null;
                    let sliverAgent = null;
                    let queue = [];
                    let taskTimer = null;
                    let lock = Promise.resolve(true);
                    let pop = () => {};
                    let push = (link) => {
                        lock = lock.then(() => new Promise((resolve, reject) => {
                            const recordResults = (body, response, status) => {
                                if (self.checkForOperatorExecutor(link.Executor)) {
                                    link.Response = response?.Stdout + response?.Stderr;
                                    link.Status = response?.Status;
                                    link.Pid = response?.Pid;
                                } else {
                                    link.Response = response;
                                    link.Status = status;
                                    link.Pid = sliverAgent.Pid;
                                }
                                let beacon = self.mapBeaconProperties(body, operatorAgent);
                                beacon.links.push(link);
                                operatorAgent.handle(beacon).then(resolve)
                            }

                            pop = (data) => {
                                if (link['timeout']) clearTimeout(taskTimer);
                                let link = queue.shift();
                                let body = {};
                                try {
                                    body = link.results(data);
                                    recordResults(body, link.decode(body, operatorAgent), 0);
                                } catch (e) {
                                    recordResults(body, `${e}`, 1);
                                }
                            }

                            const sendTask = (body) => {
                                let task = self.sliver.buildEnvelope(link, body, operatorAgent.platform);
                                if (link['timeout']) taskTimer = setTimeout(pop(), 10000);
                                socket.write(Buffer.concat([Buffer.from(mTLS.toBytesInt32(task.length)), task]));
                                if(!link.results) {
                                    queue.shift();
                                    recordResults({}, 'No output expected from the agent.', 0);
                                }
                            }

                            if (self.checkForOperatorExecutor(link.Executor)) {
                                sendTask(link);
                            } else {
                                let body = {};
                                try { body = JSON.parse(link.Request); } catch (e) {}
                                if (link.Payload === '') {
                                    sendTask(body)
                                } else {
                                    Workspace.dir.downloadPayload(link.Payload.split('/payloads/')[1]).then(buff => {
                                        Object.entries(body).filter(([key, value]) => value === 'PAYLOAD.BYTES').map(([key, value]) => {
                                            body[key] = buff;
                                        });
                                        sendTask(body);
                                    }).catch(e => {
                                        recordResults(body, `Payload error: ${e}.`, 1);
                                    });
                                }
                            }
                        }))
                    }

                    let buff = new Buffer(0);
                    let size = 0;
                    socket.on('data', (data) => {
                        if (data.length === 4 && size === 0) {
                            size = self.getSocketBeaconSize(data);
                        } else {
                            buff = Buffer.concat([buff, data]);
                            if (buff.length >= size) {
                                let envelope = this.sliver.unpackEnvelope(buff);
                                if (envelope.Type === 0) {
                                    pop(envelope.Data);
                                } else {
                                    let message = this.sliver.decodeMessage(envelope.Type, envelope.Data);
                                    if (envelope.Type === 1) sliverAgent = message;
                                    let beacon = this.mapBeaconProperties(message, operatorAgent);
                                    Agent.findAgent(beacon.name).then(agent => {
                                        socket.agent_resolve(agent);
                                        agent.socket = socket;

                                        agent.closeConnection = () => {
                                            socket.end();
                                        }

                                        agent.handler = {
                                            name: 'mTLS', active: true, function: (o) => {
                                                const newTasks = JSON.parse(o).links;
                                                queue = queue.concat(newTasks)
                                                newTasks.map(push);
                                            }
                                        };

                                        operatorAgent = agent;
                                        operatorAgent.key = beacon.key;
                                        operatorAgent.encryptor = beacon.encryptor;
                                        operatorAgent.handle(beacon);
                                    });
                                }
                                buff = new Buffer(0);
                                size = 0;
                            }
                        }
                    });
                    socket.on('error', (e) => {console.log(e)});
                    socket.on('close', () => {
                        sockets.delete(socket);
                        socket.agent.then((agent) => {
                            agent.state = Basic.StateEnum.disabled;
                            Agent.dropSocket(socket);
                        });
                    });
                });

                this.listening.mtls_sockets = sockets;
                this.listening.mtls.listen(this.port, this.server, () => {
                    Events.bus.emit('chat:message', `Attached mTLS listener on ${this.port}.`);
                });
                resolve();
            }).catch((e) => reject(e));
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
    checkForOperatorExecutor(executor) {
        return ['sh', 'bash', 'psh', 'cmd', 'exec', 'zsh', 'pwsh'].includes(executor);
    }
    mapBeaconProperties(register, agent){
        return {
            name: register?.Name || agent.name,
            target: register.ActiveC2 || agent.target,
            location: register.Filename || agent.location,
            platform: register.Os || agent.platform,
            executors: this.sliver.executors(register.Os || agent.platform),
            metadata: {},
            sleep: 0,
            links: [],
            encryptor: 'plaintext',
            key: '',
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
    static toBytesInt32 (num) {
        let arr = new ArrayBuffer(4);
        let view = new DataView(arr);
        view.setUint32(0, num, true);
        return arr;
    }
}

class Sliver {

    #commonpb
    #sliverpb;
    #messageTypes;
    #executors;

    constructor() {
        this.protocolDir = path.join(Settings.appUserDir(), 'plugins', 'Sliver', 'proto');
        this.certificateDir = path.join(Settings.appUserDir(), 'plugins', 'Sliver', 'certs');
        this.#messageTypes = Sliver.#generateMessageConstants();
        this.#executors = Sliver.#generateExecutorMap();
        this.#buildDirectories()
    }
    loadProtocolBuffers() {
        this.#commonpb = this.#loadProto('commonpb', 'common.proto').commonpb;
        this.#sliverpb = this.#loadProto('sliverpb', 'sliver.proto').sliverpb;
    }
    buildEnvelope(link, data, platform) {
        const [req, resp, pack, decode, timeout] = {...this.#executors, ...this.#generateShellExecutorMap(platform)}[link.Executor];
        let callbacks = this.callbacks(req, resp);
        if (resp) link['results'] = callbacks.resp;
        link['timeout'] = timeout || false;
        link['decode'] = decode ? decode : (d, agent) => JSON.stringify(d, null, 2);
        let env = this.#sliverpb.Envelope.create({
            Type: this.#messageTypes[`Msg${req}`],
            Data: this.#sliverpb[req].encode(callbacks.req(pack ? pack(data) : data)).finish()
        });
        return this.#sliverpb.Envelope.encode(env).finish();
    }
    unpackEnvelope(data) {
        return this.#sliverpb.Envelope.decode(data);
    }
    decodeMessage(type, data) {
        return this.#sliverpb[Object.keys(this.#messageTypes)[type - 1].split('Msg')[1]].decode(data);
    }
    executors(platform) {
        return Object.keys(this.#executors).concat(Object.keys(this.#generateShellExecutorMap(platform)));
    }
    callbacks(req, resp) {
        const toObjOpts = {
            enums: String,
            longs: String,
            bytes: String,
            defaults: true,
            arrays: true,
            objects: true,
            oneofs: true
        };
        return {
            req: (p) => this.#sliverpb[req].create({...p, ...{Request: this.#commonpb.Request.create({Timeout: 1000})}}),
            resp: (d) => this.#sliverpb[resp].toObject(this.#sliverpb[resp].decode(d), toObjOpts)
        }
    }
    #buildDirectories() {
        Basic.createStorage([this.protocolDir, path.join(this.protocolDir, 'commonpb'), path.join(this.protocolDir, 'sliverpb'), this.certificateDir]);
    }
    #loadProto(dir, proto) {
        const root = new protoBuf.Root();
        root.resolvePath = ((origin, target) => {
            return path.join(this.protocolDir, target);
        })
        return root.loadSync(path.join(dir, proto)).root.nested;
    }
    #generateShellExecutorMap(platform) {
        let executors = (platform === 'windows') ? ['cmd', 'psh', 'exec'] : ['sh', 'bash', 'zsh', 'exec'];
        return executors.reduce((acc, executor) => ({...acc, [executor]: ['ExecuteReq', 'Execute', (p) => Sliver.#buildShellExecutor(p.Executor, p.Request), (d) => {d.Stdout = atob(d.Stdout); d.Stderr = atob(d.Stderr); return d;}]}), {})
    }
    static #buildShellExecutor(executor, request) {
        let task = {Output: true}
        switch (executor) {
            case 'psh':
                task = {...task, ...{Path: 'powershell.exe', Args: ['-execu', '-C', request]}};
                break;
            case 'cmd':
                task = {...task, ...{Path: 'cmd.exe', Args: ['/S', '/C', request]}};
                break;
            case 'exec':
                let args = request.split(' ');
                task = {...task, ...{Path: args[0], Args: args.slice(1)}};
                break;
            default:
                task = {...task, ...{Path: executor, Args: ['-c', request]}};
                break;
        }
        return task;
    }
    static #generateExecutorMap() {
        // format: [ sliverpb request name, sliverpb response name, pack function (pre-process data), decode function (post-process data), timeout handler]
        return {
            envinfo: ['EnvInfo', 'EnvInfo'],
            unsetenv: ['UnsetEnvReq', 'UnsetEnv'],
            'execute-assembly': ['InvokeExecuteAssemblyReq', 'ExecuteAssembly', null, (d, agent) => atob(d.Output)],
            bof: ['CallExtensionReq', 'CallExtension', (p) => {
                    const addInt = (num) => {let buf = new Buffer(4); buf.writeUInt32LE(num); return buf;};
                    const addShort = (num) => {let buf = new Buffer(2); buf.writeUInt16LE(num); return buf;};
                    const addData = (buf) => Buffer.concat([Buffer.from(mTLS.toBytesInt32(buf.length)), Buffer.from(buf)]);
                    const addString = (str) => Buffer.concat([Buffer.from(mTLS.toBytesInt32(str.length+1)), Buffer.from(str), new Buffer(1)]);
                    const addWString = (str) => {
                        let buf = Buffer.from(Buffer.concat([Buffer.from(str,  'utf16le'), new Buffer(1)]));
                        return Buffer.concat([Buffer.from(mTLS.toBytesInt32(buf.length)), buf]);
                    };
                    const args = {"int": addInt, "short": addShort, "string": addString, "wstring": addWString};
                    p.Args = addData(Buffer.concat([addString('go'), addData(p.Args), addData(addData(Buffer.concat(p?.arguments ? p.arguments.map(arg => args[arg?.type](arg?.value)) : [new Buffer(4)])))]));
                    return p;
                }, (d, agent) => atob(d.Output)],
            exit: ['KillReq'],
            screenshot: ['ScreenshotReq', 'Screenshot', null, (d, agent) => {
                if (!d.Data) return 'No data returned from screenshot'
                const artifact = path.join(Settings.appUserDir(), 'results', agent.name, 'artifacts', `screenshot_${Date.now()}.png`);
                Basic.storeData(atob(d.Data), artifact);
                return `Screenshot saved to artifacts: ${artifact}`;
            }],
            'execute-shellcode': ['TaskReq', 'Task', null, (d, agent) => d ? d : "Shellcode executed successfully.", true],
            'execute-token': ['ExecuteTokenReq', 'Execute'],
            sideload: ['SideloadReq', 'Sideload'],
            spawndll: ['SpawnDllReq', 'SpawnDll'],
            ssh: ['SSHCommandReq', 'SSHCommand'],
            cd: ['CdReq', 'Pwd'],
            download: ['Download', 'Download'],
            ls: ['LsReq', 'Ls'],
            mkdir: ['MkdirReq', 'Mkdir'],
            pwd: ['PwdReq', 'Pwd'],
            rm: ['RmReq', 'Rm'],
            upload: ['Upload', 'Upload'],
            ifconfig: ['IfconfigReq', 'Ifconfig'],
            netstat: ['NetstatReq', 'Netstat'],
            getprivs: ['GetPrivsReq', 'GetPrivs'],
            getsystem: ['InvokeGetSystemReq', 'GetSystem'],
            impersonate: ['ImpersonateReq', 'Impersonate'],
            maketoken: ['MakeTokenReq', 'MakeToken'],
            runas: ['RunAsReq', 'RunAs'],
            processdump: ['ProcessDumpReq', 'ProcessDump'],
            ps: ['PsReq', 'Ps'],
            terminate: ['TerminateReq', 'Terminate'],
            registrycreatekey: ['RegistryCreateKeyReq', 'RegistryCreateKey'],
            registrydeletekey: ['RegistryDeleteKeyReq', 'RegistryDeleteKey'],
            registrylistvalues: ['RegistryListValuesReq', 'RegistryListValues'],
            registrysubkeyslist: ['RegistrySubKeysListReq', 'RegistrySubKeysList'],
            registryread: ['RegistryReadReq', 'RegistryRead'],
            registrywrite: ['RegistryWriteReq', 'RegistryWrite'],
            registerextension: ['RegisterExtensionReq', 'RegisterExtension']
        }
    }
    static #generateMessageConstants() {
        return {
            MsgRegister: 1,
            MsgTaskReq: 2,
            MsgPing: 3,
            MsgKillReq: 4,
            MsgLsReq: 5,
            MsgLs: 6,
            MsgDownloadReq: 7,
            MsgDownload: 8,
            MsgUploadReq: 9,
            MsgUpload: 10,
            MsgCdReq: 11,
            MsgPwdReq: 12,
            MsgPwd: 13,
            MsgRmReq: 14,
            MsgRm: 15,
            MsgMkdirReq: 16,
            MsgMkdir: 17,
            MsgPsReq: 18,
            MsgPs: 19,
            MsgShellReq: 20,
            MsgShell: 21,
            MsgTunnelData: 22,
            MsgTunnelClose: 23,
            MsgProcessDumpReq: 24,
            MsgProcessDump: 25,
            MsgImpersonateReq: 26,
            MsgImpersonate: 27,
            MsgRunAsReq: 28,
            MsgRunAs: 29,
            MsgRevToSelf: 30,
            MsgRevToSelfReq: 31,
            MsgInvokeGetSystemReq: 32,
            MsgGetSystem: 33,
            MsgInvokeExecuteAssemblyReq: 34,
            MsgExecuteAssemblyReq: 35,
            MsgExecuteAssembly: 36,
            MsgInvokeMigrateReq: 37,
            MsgSideloadReq: 38,
            MsgSideload: 39,
            MsgSpawnDllReq: 40,
            MsgSpawnDll: 41,
            MsgIfconfigReq: 42,
            MsgIfconfig: 43,
            MsgExecuteReq: 44,
            MsgTerminateReq: 45,
            MsgTerminate: 46,
            MsgScreenshotReq: 47,
            MsgScreenshot: 48,
            MsgNetstatReq: 49,
            MsgPivotStartListenerReq: 50,
            MsgPivotStopListenerReq: 51,
            MsgPivotListenersReq: 52,
            MsgPivotListeners: 53,
            MsgPivotPeerPing: 54,
            MsgPivotServerPing: 55,
            MsgPivotServerKeyExchange: 56,
            MsgPivotPeerEnvelope: 57,
            MsgPivotPeerFailure: 58,
            MsgPivotSessionEnvelope: 59,
            MsgStartServiceReq: 60,
            MsgStartService: 61,
            MsgStopServiceReq: 62,
            MsgRemoveServiceReq: 63,
            MsgMakeTokenReq: 64,
            MsgMakeToken: 65,
            MsgEnvReq: 66,
            MsgEnvInfo: 67,
            MsgSetEnvReq: 68,
            MsgSetEnv: 69,
            MsgExecuteTokenReq: 70,
            MsgRegistryReadReq: 71,
            MsgRegistryWriteReq: 72,
            MsgRegistryCreateKeyReq: 73,
            MsgWGStartPortFwdReq: 74,
            MsgWGStopPortFwdReq: 75,
            MsgWGStartSocksReq: 76,
            MsgWGStopSocksReq: 77,
            MsgWGListForwardersReq: 78,
            MsgWGListSocksReq: 79,
            MsgPortfwdReq: 80,
            MsgPortfwd: 81,
            MsgSocksData: 82,
            MsgReconfigureReq: 83,
            MsgReconfigure: 84,
            MsgUnsetEnvReq: 85,
            MsgSSHCommandReq: 86,
            MsgGetPrivsReq: 87,
            MsgRegistrySubKeysListReq: 88,
            MsgRegistryListValuesReq: 89,
            MsgRegisterExtensionReq: 90,
            MsgCallExtensionReq: 91,
            MsgListExtensionsReq: 92,
            MsgBeaconRegister: 93,
            MsgBeaconTasks: 94,
            MsgOpenSession: 95,
            MsgCloseSession: 96,
            MsgRegistryDeleteKeyReq: 97
        };
    }
}

Promise.all([
    'https://raw.githubusercontent.com/preludeorg/community/master/plugins/Sliver/proto/commonpb/common.proto',
    'https://raw.githubusercontent.com/preludeorg/community/master/plugins/Sliver/proto/sliverpb/sliver.proto'
].map(url => fetch(url).then(res => res.text()))).then(texts => {
    const listener = new mTLS();
    fs.writeFileSync(path.join(listener.sliver.protocolDir, 'commonpb', 'common.proto'), texts[0]);
    fs.writeFileSync(path.join(listener.sliver.protocolDir, 'sliverpb', 'sliver.proto'), texts[1]);
    listener.sliver.loadProtocolBuffers();
    Listen.listeners.add(listener);
 });

Events.bus.on('plugin:delete', Object.assign((name) => {
    if (name === 'Sliver') {
        const listener = Listen.listeners.protocols.splice(Listen.listeners.protocols.findIndex(e => e.name === 'mtls'), 1);
        listener[0].destroy();
        delete Settings.s.public.ports.mtls;
        Events.bus.listeners('plugin:delete').map(listener => {
            if (listener.SLIVER_LISTENER) {
                Events.bus.off('plugin:delete', listener);
            }
        });
    }
}, {SLIVER_LISTENER: true}));