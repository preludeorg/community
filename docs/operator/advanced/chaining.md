
# How chaining works

#### Use facts to build chained attacks

---

Each executed TTP in Prelude is called a link and the full set of procedures run for an agent is known as its
chain. Prelude uses a dynamic way of chaining procedures together - by linking the output of one to the input
of another through parsing TTP output for contextual Indicators of Compromise (IoC). The concept isn't dissimilar to
how pipes work in bash or PowerShell.

### Facts replace variables

---

As a TTP is executed, the output of the procedure is passed through a series of regex statements
where Prelude attempts to parse data out of the arbitrary text. These results are saved to the agent
which ran the TTP in the form of a key/value pair, called a fact. You can alternatively add your own facts to
an agent if you want to predefine knowledge. As the planner determines which TTP to run next, Operator replaces
variables inside each command (seen by the #{} syntax) with matching facts.

### Types of facts

---

There are three types of facts:

- Automatic facts. These start with either operator or agent and are immutable - they are not designed to be modified
by hand. Operator facts represent the state of your Operator app and agent facts represent the state of a particular 
agent. Examples are ```agent.name```, which will be replaced with the agent name in context and ```operator.callback```
which will be replaced by the Operator FQDN/IP address. If you see automatic facts inside TTP commands, you can ignore
them, as they'll be handled automatically. 
- Discovered facts. These facts are also generated automatically. As you run TTPs, each result is passed through a
series of regex statements which parses out found indicators of compromise into facts - so they can
automatically be used in TTPs later in the chain.
- Custom facts. You can define your own facts for agents and scope them to either the particular agent, the entire 
range the agent belongs to, or to all agents. For example, you may want to create a fact called ```my.password```
with a value of ```password123```. By scoping this fact to all agents, you can use this password as a variable across
any TTP you run.

#### Available automatic facts

- operator.callback: the FQDN/IP of Operator
- operator.session: the API token.
- operator.tcp: the served TCP port
- operator.udp: the served UDP port
- operator.http: the served HTTP port
- operator.tcp_shell: the served reverse-shell port
- agent.name: name of agent
- agent.range: range of agent
- agent.location: location on disk to the agent file

#### Discovered fact IoCs

- file
- directory
- ip
- domain
- password

If you're interested in the regex used to do the parsing, reach out to the Prelude team.

### Discovered fact keys broken down

---

Discovered fact keys come in four flavors:

- IoC. Use any IoC on its own to pipe it into a command. Example: ```file```.
- IoC.tactic. Add a tactic to the IoC to specify you only want to use facts discovered by that tactic. Example: ```file.discovery```.
- IoC.technique. Add a technique to the IoC to specify you only want to use facts discovered by that technique. Example: ```file.T1005```.
- IoC.procedure. Add a procedure ID to the IoC to specify you only want to use facts discovered by that TTP. Example: ```file.fa6e8607-e0b1-425d-8924-9b894da5a002```.

Take this example key: ```file.T1005```. When Operator is given a command with this variable in its command, it will 
replace ```file.T1005``` with any files found (if any) from running a T1005 classified procedure earlier in the chain.
If none are found, the TTP is skipped.

### Teach me how to use facts

---

You can leverage facts by sprinkling variables throughout your procedure commands. For example, instead of
writing a procedure that looks like this:

```shell
cp /etc/hosts.conf /tmp
```

You could write it like this, which will copy any file found earlier in the chain:

```shell
cp #{file} /tmp
```

Getting more specific, you could specify you only want to include files found from a prior discovery tactic:

```shell
cp #{file.discovery} /tmp
```

Getting even more specific, you could specify you only want to include files found from a prior T1005 technique:

```shell
cp #{file.T1005} /tmp
```

Or you may want to pipe the output of a specific TTP (e75c8d27-c7ff-4069-8f50-3ef4a159a131) into your command:

```shell
cp #{file.e75c8d27-c7ff-4069-8f50-3ef4a159a131} /tmp
```
