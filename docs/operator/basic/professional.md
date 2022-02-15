# Professional license

#### Designed for those who want continuous cutting-edge TTPs

---

The Operator Professional license is designed for red, blue or purple team members,
penetration testers, security engineers or others who are looking to perform offensive security 
in a professional setting. 

### TTP Tuesday subscription

---

Every Tuesday, the Prelude security team releases a new [attack chain](https://chains.prelude.org) containing a handful of TTPs.
Each chain is loaded into Operator automatically and can be executed against your connected agents. Chains are designed 
using open-source intelligence (OSINT) and often model either real world threat groups or common attack patterns seen in the wild.
The idea is simple: by getting a continuous stream of high quality ready to run attacks, you can perform security testing more frequently.

### Chains API

---

Operator is the most fluid way to ingest, manage and execute the attack chains from TTP Tuesday, but you can alternatively
use the API directly.

> Note: Each request should also contain a User-Agent header, left out of these examples for brevity.

#### Start by logging in, which will send an email verification to your claimed account:

```bash
curl -X POST -H 'Content-Type: application/json' "https://login.prelude.org/claim" -d '{"action":"send","claim":"example@prelude.org"}'
```

#### Use the token you received to complete the login process, which will generate you an API token you can use moving forward:

```bash
curl -X POST -H 'Content-Type: application/json' "https://login.prelude.org/claim" -d '{"claim":"$TOKEN"}'
```

#### Using your new token, you can access the Chains API in the following ways: Get the 10 most recently released chains.

```bash
curl -X GET -H 'Content-Type: application/json' "https://login.prelude.org/chains?count=10&email=example@prelude.org&token=$TOKEN"
```

#### Some chains contain payloads. You can download each.

```bash
curl -X GET -H 'Content-Type: application/json' "https://login.prelude.org/chains/payload=sha1/payload?email=example@prelude.org&token=$TOKEN"
```

### Private support

---

Professional license holders gain access to a private Discord channel where they can get 1-on-1 support from the Prelude team. 
Additionally, those in the channel are invited to our cohort
meeting - every 6 weeks - where the Prelude team demos upcoming features and talks about the roadmap.
