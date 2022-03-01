
# Sliver Implant plugin

### What is Sliver?

---

Sliver ([github](https://github.com/BishopFox/sliver)) is an open source cross-platform adversary emulation/red team framework, it can be used by organizations of all sizes to perform security testing. Sliver's implants support C2 over Mutual TLS (mTLS), WireGuard, HTTP(S), and DNS and are dynamically compiled with per-binary asymmetric encryption keys.

### What does the Sliver plugin do?

---

Using the Sliver plugin allows you to directly attach Sliver implants over mTLS protocol. You are able to generate new implants in Sliver, then leverage the mTLS certificates to connect the agents to Operator. The plugin defaults to listening on port 8080, but you can configure it to be any port.

### Configuring the plugin

---
 
First, go the setting and click on Sliver plugin to install it. Next, you must install the mTLS certificates from Sliver. Grab the 3 required certificates from the system where you've installed Sliver:

- ~/.sliver/certs/mtls-server-ca-cert.pem
- ~/.sliver/certs/mtls-server-ca-key.pem
- ~/.sliver/certs/mtls-implant-ca-cert.pem

Copy those certificates to the following folder (depending on platform):

- **macOS:** ~/Library/Application\ Support/Operator/portal.prelude.org/plugins/Sliver/certs
- **linux:** ~/.config/Operator/login.prelude.org/portal.prelude.org/plugins/Sliver/certs
- **Windows:** %APPDATA%\Operator\login.prelude.org/portal.prelude.org/plugins/Sliver/certs

Restart Operator to reload the certificates (or change the listening port, which reloads the listener as well).

Now you can generate Sliver implants and connect them to the server:

```shell
sliver > generate --mtls 127.0.0.1:8080 --save /tmp --os darwin --debug
```

```shell
./TOUGH_CITY
```