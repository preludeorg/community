# Protecting your data

#### Data is encrypted at REST and in transit

---

Protecting your sensitive data is important. Operator encrypts all commands executed, the results of
those commands, and all facts collected when the information is saved to disk. Prelude is not able
to decrypt any of this information and does not back up or store this key.

When you first log in to Operator, a symmetric encryption key is randomly generated and saved to a **.secrets**
file inside your Prelude workspace. We highly recommend you back up this key file as you will
not be able to decrypt your data without the key.

#### Your Prelude workspace

- **macOS:** ~/Library/Application\ Support/Operator/portal.prelude.org
- **linux:** ~/.config/Operator/portal.prelude.org
- **Windows:** %APPDATA%\Operator\portal.prelude.org

### Publishers

---

Publishers allow you to control what you want leaving your computer. By default, Operator only saves your attack
data locally, in your workspace. However, you can configure additional locations to publish your data - such as a SIEM
or external database - by going to the Publisher area within a redirector.

### Telemetry

---

Operator talks to a Prelude-owned server called Headquarters (HQ) through an API. HQ has dual-purposes: it 
acts as the authentication server if you are logged in and it serves the resources that load into your app. 
Resources are your TTPs, payloads, training modules and plugins. You can simulate what Operator looks like 
without telemetry by turning off your internet. All core functionality will work, 
but you'll only have access to the resources you downloaded while online.
