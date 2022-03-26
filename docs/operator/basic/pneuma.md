# All about Pneuma

#### The default agent supported by Operator

---

To get the most out of Operator, you'll need to deploy an agent on a remote computer 
in order to run a security test against it. Pneuma is the default agent that ships with Operator. 
It is intended to support most of the core features available in Operator. As such, you'll
see that it allows you to connect to this app over any built-in protocol (TCP, HTTP, UDP),
connect a reverse shell with 1-click and leverage any executor in the Community repository 
including the custom keyword executor. Pneuma is written in GoLang in order to run without installation on Windows, Linux and MacOS.

### Where to get it

---

You can find Pneuma on [GitHub](https://github.com/preludeorg/pneuma), as it is fully open-source. 
Alternatively, you can download a pre-compiled version from the main section.

### How to use it

---

From the terminal, run Pneuma with the -help parameter to access the current menu of options. 
The most popular parameters to use are:

- contact: the protocol for connecting to Operator, such as TCP or HTTP
- address: the location of Operator. Usually IP:PORT but if using the http contact, you'll need http://IP:PORT


### The more powerful PneumaEX

---

Professional license holders get access to PneumaEX, an extended version of the open-source Pneuma
agent. PneumaEX can be accessed through the Operator application, under the Agents area towards the bottom of the UI. 


