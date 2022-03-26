# How listeners work

#### Using listeners as an interface to agents

---

Operator provides an extensible way to build listener interfaces for various protocols and beacons. Each listener is a simple
super-class of the base Listener class which consists of 2 core functions: `init()` and `destroy()`. A minimal implementation
of a listener would only implement the `init()` function and leverage the existing `destroy()` implementation.

#### Available built-in listeners

---

- http
- udp
- tcp
- shell (reverse shell handler)

### Custom HTTP listener plugin

---

It is possible to extend Operator to have custom listeners. This example shows how to add a very simple HTTP server endpoint
using the available express library.

#### Example: Save this plugin as HTTP.js inside an HTTP directory in your workspace plugin directory

A plugin javascript file:

```javascript
const PLUGIN_NAME = 'HTTP';

const Listen = require('../lib/listen');
const Listener = require('../objects/listener');

class HTTP extends Listener {
    constructor(config) {
        super('custom-http');
        this.http_port = config?.http_port || 8080;
    }
    init() {
        return new Promise((resolve, reject) => {
            this.destroy().then(() => {
                Requests.fetchOperator('/v1/settings', {method: 'GET'}).then(res => res.json()).then(settings => {
                    let express = require('express');
                    let app = express();
                    // configure app endpoints
                    this.listening = app.listen(this.http_port, settings.server, () => {});
                    resolve();
                });
            }).catch(e => {
                reject(e)
            });
        });
    }
}

Requests.fetchOperator(`/v1/plugin/${PLUGIN_NAME}`, {method: 'GET'}).then(res => res.json()).then(config => {
    Listen.listeners.add(new HTTP(config));
});
```

A corresponding configuration file for this plugin that you need to add to that folder as `config.yml`:

```yml
name: HTTP
description: Enable an HTTP listening post.
```
