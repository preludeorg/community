# Learn about redirectors

### Provision and connect

---

A redirector is a Linux server running a headless version of Operator - meaning Operator without Electron. 

You can provision new redirectors from the Connect plugin. You can choose either AWS or GCP as your redirector 
cloud host. Alternatively, you can provision a redirector manually on a server of your choice.

### Cloud provisioning

We recommend using Connect to provision redirectors because it is point-and-click. Simply head into the Connect 
plugin, attach your AWS or GCP account, and provision a new redirector. When you're done, you can point your agents
to your redirector instead of your Operator IP address.

### Manual provisioning

If you want to manually provision a redirector, follow these steps.

#### The Setup

---

Start by downloading a headless version of Operator from the [Prelude website](https://www.prelude.org/download/current) 
to the location of your desired server. Once you have accomplished this, next you will have to create a compatible SSH key 
for your redirector.

#### Example: Generating SSH key

```shell
ssh-keygen -t rsa -f /tmp/headless/ssh_key -q -N
```

#### Starting your redirector

---

Once the prelude-headless-linux file is in the desired location you can now start it through the following command, 
after inputting your proper hostName, sessionToken and newly created SSH key.

#### Example: Start your headless operator

```shell
nohup sudo /tmp/headless/bin --sessionToken 'random character string' --sshKey /tmp/headless/ssh_key --hostName 'valid.domain.tld' >/tmp/headless/headless.log 2>&1  &
```

#### Adding your redirector

---

Now on your system that you wish to use Operator desktop app, we will add this new redirector into your workspace. 
Open your workspace settings.yml (see docs) and add information about your remote system in the following format:

#### Example redirector format

```yaml
redirectors:
    valid.domain.tld:
        key: /full/path/.ssh/operator_key
        user: ubuntu
        password: 'random character string'
        availableAt: '2022-01-11T01:13:51.701Z'
        tools:
        - headless/headless
        aws: {}
```

### Using your redirector

---

Now that we have our redirector added and running, refresh Operator and connect to it from the Connect plugin.

#### Example: how to view headless logs

```shell
tail -f /tmp/headless/headless.log
```
