
# Enterprise license

#### For those working on a team or running continuous security testing

---

The Operator Enterprise license is designed with three cases in mind:
- Work on a red team and want a "team server" environment
- Want hands-off, API-driven security testing and web access to their aggregate results
- Run classroom style security training

The Enterprise license includes all features in Professional, in addition to those outlined below.

### Aggregate results

---

When you run security assessments out of Operator your (sanitized) results will pipe into [Headquarters](https://login.prelude.org) (HQ),
a Prelude-controlled API and web portal. From HQ, you can monitor all security assessments happening in
your environment, view the results from any deployed adversaries and schedule TTP chains to run on your endpoints.
HQ even supplies team management features. You can add/remove seats on your account and keep an eye on the 
training progress of your team.

### Private Outpost server

---

Each time you boot up Operator, it contacts Prelude's [Outpost servers](https://feed.prelude.org/p/a-drop-in-the-bucket)
which are simple wrapper APIs for our community and professional git repositories. The TTPs, payloads, plugins and training 
programs (we call this a "bucket repo") available to you load into your app. Enterprise license holders 
get a copy of the Outpost source code and the ability to attach it to their account. This allows you to host your own private
collection of resources. Create your own TTPs or even your own training programs.
You can even attach a database to ensure all security results are stored only on your servers, not ours.

### Disposable team server

---

From the Connect section, Enterprise license holders can connect to their teammates'
Operator instances. By doing this, they are able to create a "mesh C2" where any agent beaconing to
a shared Operator instance will instantly mirror on all apps simultaneously. This allows
a red team to work more efficiently as a unit.