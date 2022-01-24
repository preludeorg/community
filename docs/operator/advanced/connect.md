
# Working with Connect (Redirectors)

#### Architecture Overview

---

Redirectors are headless versions of Operator running on remote systems. Prior to Operator 1.4, redirectors would
use a small binary called "Switchboard" that would handle socket redirection on the remote system.

#### gRPC Functionality

---

Operator establishes a primary connection to the remote redirector using gRPC. This connection is used to transmit
agent data, result data, and more.

#### HTTP Functionality

---

When a new connection is established with a Redirector, an Operator instance is assigned a base HTTP URI prefix that
maps directly back to their system. This enables agents to connect back to a specific system while using the HTTP
port specified on the remote redirector.

#### Example: Start a Pneuma agent pointing at a redirector with a URI

```shell
bash-3.2$ ./pneuma-linux -address http://remote_fqdn:3391/custom_uri -contact http -name example -debug
```

Prefixes are automatically assigned using a Dirbuster list containing common HTTP URIs. Users have the option to
edit and manually assign a URI prefix.

#### TCP and Reverse Shell Functionality

---

TCP beacons and Reverse Shells are handled using an SSH reverse tunnel established on the redirector. Connections
will be forwarded directly back to the system that established the connection.