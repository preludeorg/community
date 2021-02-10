# Community

Here you will find an open-source collection of TTP files, organized by ATT&CK tactic. Each procedure describes a single action an adversary
may attempt post-compromise of a network or system.

> TTP files can be used on their own or within the Prelude Operator desktop app, where they are loaded by default on each restart. Inside Operator, you are able to import TTPs from Atomic Red Team, Caldera and other popular sources. [This video](https://www.youtube.com/watch?v=kY3-NBES1gk) shows how to import TTPs from external sources and [this video](https://www.youtube.com/watch?v=OWjgS8bzJf0) shows how to develop new procedures from within Operator.

## Understand the format

Take this example procedure. It supports three platforms (Windows, Darwin and Linux) and under each, it supports a handful of
executors: psh (PowerShell), cmd (command-line), and sh (bash).

```
id: 5a39d7ed-45c9-4a79-b581-e5fb99e24f65
metadata:
  version: 1
  authors:
    - privateducky
  tags: []
name: System processes
description: |
  Identify which processes are running on the local computer. This procedure is helpful to get a snapshot in time of
  what a computer is doing.
tactic: discovery
technique:
  id: T1057
  name: Process Discovery
platforms:
  windows:
    psh:
      command: Get-Process
    cmd:
      command: tasklist
  darwin:
    pwsh:
      command: Get-Process
    sh:
      command: ps aux
  linux:
    sh:
      command: ps aux
```

## Introducing payloads

Some executor blocks may include a payload property, such as:
```
sh:
  command: |
    chmod +x pneuma-darwin && nohup ./pneuma-darwin &
  payload: https://s3.amazonaws.com/operator.payloads/pneuma/pneuma-darwin
```
This procedure expects the payload (found at the HTTP address) to be downloaded to the target before executing the command. All Prelude agents do this by default.

## Introducing variables

Inside some commands, you will see variables, identified by a #{} syntax, such as:
```
copy #{file.T1005} #{directory.T1074}
```
The variables are meant to be replaced at runtime. In the Operator, this happens automatically but if you want to use
these files manually, you will need to fill in the desired values. The more variables you use, the more dynamic your operations will be.

Variables are either discoverable or automatic.

### Discoverable variables

Discoverable facts are those you anticipate a Prelude agent to find on its own. 

* **file**: references the absolute file path on disk
* **directory**: references the absolute path to a directory
* **ssh**: an ssh connection command
* **ip**: an ipv4 address
* **domain**: a valid domain and top-level domain (google.com)

When using discoverable variables inside commands, remember to place a dot separator with the technique ID you want the replaced
variable (fact) to come from. For example, the following variable will be replaced with each file found by running
a T1005 procedure:
```
#{file.T1005}
```

Prelude Operator parses the results from every run command, attempting to learn <i>facts</i> - which automatically fill in variables - unlocking additional procedures for execution.

### Automatic variables

Automatic facts are environmental and are applied to an agent based on conditional logic.

* **operator.session**: a unique key for your Operator session. The session key regenerates on each restart of the app and is used internally to help validate external connections originated in the app.
* **operator.payloads**: callback address of your HTTP payload server (defaults to operator.http)
* **operator.http**: callback address of your HTTP server
* **operator.tcp**: callback address of your TCP server
* **operator.udp**: callback address of your UDP server
* **operator.grpc**: callback address of your GRPC server
* **agent.name**: current name given to the agent
* **agent.location**: absolute file path of the agent file on disk

### Custom variables

Custom facts are user defined facts that can be arbitrarily defined. In general, follow the outline of `<ATT&CK Tactic>.<general description>` when defining these facts.

Example for defining a custom NetCat listening post:
* **exfiltration.netcat.ip**: IP address of the NetCat listener
* **exfiltration.netcat.port**: Port NetCat is listening on on that server


## CALDERA inspired

As former CALDERA leads, this project was originally forked and designed off of the MITRE Stockpile repository.

## Interested in contributing?

We strongly support contributors to this project. Please fork this repo and submit pull requests for considerations.
