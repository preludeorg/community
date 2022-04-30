# Learn about redirectors

### Get started

---

A redirector is a Linux server running a headless version of Operator - meaning Operator without Electron. 

You can provision new redirectors from the Connect section. The process is simple:
- Download a headless version of Operator.
- Run it on any Linux server, ensuring your desktop has access to port 50051 and 8888.
- Enter the host and token for the redirector (the token prints to console) into the Connect section.
- You will now be connected.

At this point, Operator will "transport" you into the redirector view. All local
listening posts (on your desktop) will turn off and all local agents will be replaced with those
running on the redirector. 

If you have an enterprise license, you can provision redirectors in your preferred cloud provider by heading to the
'Provision Cloud Resources' panel inside Connect.

### Your redirector panel

---

When you click into a redirector (from the Connect section) you will see:
- Info about it, including the Operator version it's running.
- A list of all agents currently connected to it. Each Operator instance can have up to 5 (Community) or 50 (Professional) agents connected to it simultaneously.
- The ability to connect/disconnect your desktop to it.
- A button to open the encrypted chat channel running on it. This is useful if you have an enterprise license and are using the redirector as a team server.

#### Upgrading your redirector

If your redirector becomes out of date, running an older version of Operator, you will see an "update required" link
inside the redirector panel. Clicking this update your redirector to the latest version. It does this by:
- Downloading the latest Headless version into the APPDATA directory on the redirector host, overwriting the prior version.
- Stopping the Headless process.

This upgrade process assumes you have a supervisor on the redirector that will restart the Headless version if it stops.

To do this, follow these steps (which are the default if you provision redirectors through the 'Provision Cloud Resources' panel):
- Run Headless from the APPDATA directory on the redirector.
- Start Headless using a supervisor. We use immortal, as you can see in the [Headless installation TTP](https://github.com/preludeorg/community/blob/master/ttps/resource-development/e22b3ca7-6181-49ca-ab14-52ff9b7f49be.yml)