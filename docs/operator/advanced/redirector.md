# Learn about redirectors

### Get started

---

A redirector is a Linux server running a headless version of Operator - meaning Operator without Electron. 

You can provision new redirectors from the Connect section. The process is simple:
- Download a headless version of Operator.
- Run it on any Linux server, ensuring your desktop has access to port 50051 and 8888.
- Enter the host and token for the redirector (it will print to console) into the Connect section.
- You will now be connected.

At this point, Operator will "transport" you into the redirector view. All local
listening posts (on your desktop) will turn off and all local agents will be replaced with those
running on the redirector. 

### Your redirector panel

---

The redirector panel you connect/disconnect from is broken down into the following sections:
- Endpoints: these are the agents currently connected (online) to the redirector.
- Redirector: this offers an introduction to your redirector.
- Outpost: statistics about what is available on the redirector, per the Outpost servers it is connected to.
- Publishers: the EDR/SIEM dashboards enabled on your Outpost server and in effect, available to your redirector.

#### Endpoints

---

Each Operator instance can have up to 5 (Community) or 50 (Professional) agents connected to it simultaneously.
Use more redirectors to support additional agents.

#### Redirector

---

Aside from the informational panel here, you can perform two actions: copy creds and join chat. 

Each redirector has a host/token pair which you use to connect. If you are part of an enterprise account, 
you can pass these to a teammate (copy creds), and they can share a redirector with you. Joining the chat will 
open a new window, exposing an encrypted chat channel running on your redirector. Here, you can communicate 
with any teammates also connected.

When multiple teammates are connected to the same redirector, it will act as a "team server". Every agent, TTP, 
chain, schedule, settings update, etc., will be mirrored across all connected Operators. 

#### Outpost

---

Outpost is a remote server hosting Operator content, such as TTPs, payloads and plugins. Prelude supplies 
an open-source Outpost serving https://github.com/preludeorg/community and a closed-source Outpost for 
license holders. Enterprise accounts can host their own.

In the Outpost panel of a redirector, you can see its number of Outposts and available TTPs. 

#### Publishers

---

Outposts can be backed by a publisher - a connection to an EDR or SIEM dashboard - that forwards your 
result (meta)data to a central location. If you have an enterprise account, you can set up any publisher to 
direct data to your environment. If you are a community or professional user, the metadata is sent to the 
default Prelude publisher (which does not store the data).

### Enterprise

---

An enterprise license to Operator enables you to run large-scale automated security testing
inside your cloud environment. 

When it comes to redirectors, an enterprise license opens up three new panels in the Connect
section:

#### Attach a cloud account

---

Link either an AWS or GCP account to your Operator instance. Additional cloud providers coming
in the future.

#### Provision a cloud redirector

---

Instead of manually setting up a server to run headless Operator, you can create new 
fully-functional redirectors in your own cloud environment at the click of a button.

#### Provision a cloud VM

---

Create newly compromised servers - either Linux or Windows - in your own cloud environment. 
These servers will have an agent dropped on them, which will connect to the redirector of your
choice. Use these cloud VMs to test your TTPs and chains.
