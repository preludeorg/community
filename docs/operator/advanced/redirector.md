
# How to set up manual redirectors

#### Create, stand up, and connect

---

A redirector is a headless version of Operator, that can deploy without the full electron application and user interface. Through Connect, we already provide the ability to create and connect redirectors that are hosted on third party cloud services. This guide is for those that want to stand up their own 
redirectors either locally or without support of cloud services.

#### Download headless Operator

---

The first thing you will want to do is download a headless version of Operator from the [Prelude website](https://www.prelude.org/download/current) to the location of your desired server. If you do not have the ability to download it to the server, you can use a combination of SSH commands to transfer the file.

#### Starting your redirector

---

Once the prelude-headless-linux file is in the desired location you can now start it through the following command, after inputting your proper hostName and sessionToken.

#### Example: Start your headless operator

```shell
nohup ./headless-linux --sshKey /tmp/headless_ssh_key --hostName 'valid.domain.tld' --sessionToken 'random character string' &
```

#### Adding your redirector

---

Now on your system that you wish to use Operator desktop app, we will add this new redirector into your workspace. Open your workspace settings.yml 
(~/Library/Application\ Support/Operator/login.prelude.org/settings.yml or 
~/.config/Operator/login.prelude.org/settings.yml) and add information about your remote system in the following format:

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

#### Using your redirector

---

Now that we have our redirector added and running you can go back into Operator and connect to it within the Connect plugin.

#### Example: how to view headless logs

```shell
tail -f /tmp/headless/headless.log
```