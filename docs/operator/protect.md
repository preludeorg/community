
# Protecting your data

#### Data is encrypted at REST and in transit

---

Protecting your sensitive data is critically important. Operator encrypts all commands executed, the results of
those commands, and all facts collected when the information is saved to disk. Prelude Research, Inc. is not able
to decrypt any of this information and does not back-up or store this key.

When you first login to Operator, a symmetric encryption key is randomly generated and saved to a **.secrets**
file inside your Prelude workspace. We highly recommend you back up this key file as you will
not be able to decrypt your data without the key.

#### Your Prelude workspace

### Publishers

---

Publishers allow you to control what you want leaving your computer. There are two default publishers, Local
and Prelude. The former will save results to your local workspace, on disk. The latter will forward the attack
classification of your deployed adversaries, such as the tactic and technique of each TTP, to a Prelude
database which will use this information to create security recommendations. Additionally, there is a Publisher
plugin which allows you to add more publishers. You can easily publish your data to Splunk, Elastic,
Slack, Discord, VECTR or other database solutions.

### Telemetry

---

Operator talks to a Prelude-owned server called Headquarters (HQ) through an API. HQ has dual-purposes: it 
acts as the authentication server if you are logged in and it serves the resources that load into your app. 
Resources are your TTPs, payloads, training modules and plugins. You can simulate what Operator looks like 
without telemetry by turning off your internet. All core functionality will work, but you'll only have access to the resources you downloaded while online.
