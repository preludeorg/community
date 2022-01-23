
# Exfil over HTTP

#### Metadata

- *Prelude ID*: 6e7b1a92-14e8-4a1f-b1ce-ccb0fe313bcf
- *MITRE Technique ID*: [T1048.003](https://attack.mitre.org/techniques/T1048/003/)

### A hacker's perspective

Occasionally I will want to exfiltrate data from a system using a capability that doesn't exist on target and isn't myC2 channel. Often times built-in tools will be flagged or caught by command line monitoring tools, so having a modulethat lets me exfiltrate data that I can dynamically load into my agent is important. This particular module will perform anout-of-band HTTP PUT operation using a completely separate process from the primary C2 process, but also not usingcommand line tools. Similar to the PneumaEX agent C2, this uses GOLang's built-in HTTP library to create a request clientand PUT the data to a target server.

### Expected output

No output beyond a simple notification expected as this just does a multipart upload to the server without any serverresponse.

### Basic variations

Using the module system, there are numerous out-of-band exfiltration methods that we can implement in code. Additionally,since modules can be written in any language, it is possible to build platform specific modules to exfiltrate data usinglanguages like C#/.NET for Windows and Swift for OS X.

### Prevent + Detect

Use netflow monitoring tools to check for large outbound data transfers over HTTP, especially if it's originating fromprocesses that are not typically network connected. Filter network traffic and implement SSL/TLS Inspection if possibleto see outbound data flows in the case of HTTPS traffic.

### How it is chained

Now that an adversary is considering exfiltration, they've reached one or more of their objectives and have dataworth the risk of exfiltrating. They might continue exfiltrating data over this channel or another channel.  Additionally,they will cover their tracks by eliminating as many indicators of compromise as possible. Depending on the adversary'sintent and objectives, they might also destroy data (T1070.004|T1485) or deface internal services (T1070.001|T1070.002|T1491.001).
