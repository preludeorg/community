
# How the planner works

#### Intelligent Decision-Making At Scale

---

The planner is a multi-level finite state machine which determines the TTP order when a chain is deployed. The
procedures inside a chain are naturally unordered. Once deployed, it looks at the planner for a decision
every time a decision is needed. The finite state algorithm organizes all TTPs into a *kill-chain* based by ATT&CK tactic and then again by technique. Then, it executes one tactic at a time until it exhausts
all TTP files in a given chain.

### Always learning

---

When a chain executes, it collects information which Prelude Operator can learn from. As this info is
processed, it is fed back into the planner, often opening up a previously closed state. For example, say the planner
is currently busy executing decisions for a chain, which has completed the first two tactical states above,
and it is executing procedures under Discovery. If the planner learns something which can unlock a "defense evasion"
procedure it will instruct the chain to drop out of the discovery state and into the defense evasion one in
order to do the newly discovered action.

### Available planners

---

Operator contains a built-in planner which can be configured through the Settings section. The built-in
planner uses a multi-layered finite-state machine to iterate over ATT&CK tactics when executing a chain.

### Build your own planner

---

You can write your own API-based planner by standing up an API with a /planner/decide endpoint. Your API
will be sent a list of decisions each time Operator loops through an agent's queued instructions. You will
need to output the identifier(s) you want to run next.

#### Example: Write your own planner in Python

```python
from aiohttp import web


async def handle(request):
    data = await request.json()
    ttps = data.get('procedures')
    if ttps:
        print('Received %d decisions to consider' % len(ttps))
        chosen = list(ttps)[0]
        print('You chose to execute: %s next' % chosen)
        return web.json_response([chosen])
    return web.json_response([])


app = web.Application()
app.add_routes([web.post('/planner/decide', handle)])


if __name__ == '__main__':
    web.run_app(app, port=9000)
```

A planner will receive a simple dictionary of decisions to consider, along with the agent which we 
are planning against. The planner should return a list of TTP identifiers to execute next.

#### Example: JSON object planners receive

```json
{
    "token":"$TOKEN",
    "email":"$EMAIL",
    "agent":"host1",
    "procedures":{
        "4e97e699-93d7-4040-b5a3-2e906a58199e": {
            "technique":"T1074", "tactic":"collection", "operation":"UUID-of-operation"
        },
        "90c2efaa-8205-480d-8bb6-61d90dbaf81b": {
            "technique":"T1005", "tactic":"collection", "operation":"UUID-of-operation"
        },
        "300157e5-f4ad-4569-b533-9d1fa0e74d74": {
            "technique":"T1560.001", "tactic":"exfiltration", "operation":"UUID-of-operation"
        }
    }
}
```

### Continued research

---

The planner is a deep area of research for the internal team. Currently, the team is developing
more intelligent planners, which consider more than order when exiting and entering states. If
you would like more details on this area, please reach out to us.