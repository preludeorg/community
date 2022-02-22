
# Enumerate AD subnets

---

### Metadata

This is a man page for a TTP available in Operator. Man pages provide additional context around procedures and should be consulted if you are looking to learn about a particular chain.

- *TTP Identifier*: e4cdb5c6-d322-3b6e-ac8e-68b2e8a7dd4c
- *MITRE Technique ID*: [T1016](https://attack.mitre.org/techniques/T1016/)

---

### A hacker's perspective

---

Similar to computer object discovery, subnet discovery provides key information for understanding the structure of the target network. While I probably have significant passive reconnaissance that gave me a basic layout of the network prior to initial access, this step gives me much more specific and accurate subnet information for the domain. I'll need this information to begin moving laterally and targeting specific services that are necessary to achieve my overall objectives. 

### Expected output

---

Text file (file.T1016) containing details on the computer objects that exist on this Active Directory domain. 

### Basic variations

---

AdFind is just a simplified standalone tool for making calls to Active Directory. That being said, there are several "live off the land" binary alternatives attackers can leverage to achieve the same effect. An attacker could use the built-in powershell.exe binary and run `Get-ADReplicationSubnet -Filter *` if the AD Powershell tools are installed. There are more sophisticated method to grab the information as well through directly interacting with Windows internal .NET APIs like System.DirectoryServices.ActiveDirectory.DirectoryContext. 

### Prevent + Detect

---

Unfortunately, this tool (and the others in this category) largely leverage normal system and network discovery methods used for legitimate traffic on networks. Monitoring command line and powershell script blocks can help tie this command to other activity that might help identify it as malicious. If it is possible to monitor Windows API calls on, that could also aid in detecting malicious chains of activity. 

### How it is chained

---

Attackers will use information gathered from system network configuration discovery to shape their overall follow-on strategy, keeping in mind their original objective. If the adversary's objective is the steal data and ransom it, then this step will be the precursor to further infection via lateral movement actions such as pass the hash to drop custom malware on remote systems via lateral transfer tools (T1550.002|T1570). They'd then be able to remotely execute those droppers using system services or even better, software deployment tools (T1569|T1072), to perform a coordiated mass-ransomware attack. 
