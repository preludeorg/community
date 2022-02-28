# Operator API

#### Interact with the underlying Operator functionality

---

The Operator platform is built on top of an internal API.


### SSL

---
The internal API uses a self-signed certificate by default, as it is only accessible on localhost. Since
you own both sides of the connection (client and server) we are optimizing for preventing network sniffing, 
not trust between the client and server.

### Authentication 

---
The API requires a token to be passed with the request. Your token can be found in:
Operator -> Settings -> Network -> Token. Set the variable $TOKEN to your token.


## Endpoints 

### Chains

---
#### Get all chains loaded in Operator

```bash
curl -X GET -sk -H "Authorization: $TOKEN" "https://localhost:8888/v1/chain" | json_pp
```

#### Get a specific chain by identifier

```bash
curl -X GET -sk -H "Authorization: $TOKEN" "https://localhost:8888/v1/chain/printnightmare" | json_pp
```
#### Create a new chain

```bash
curl -X POST -sk -H "Authorization: $TOKEN" -H 'Content-Type: application/json' "https://localhost:8888/v1/chain" -d '{
    "name": "my_new_adversary",
    "ttps": [
        "5c4dd985-89e3-4590-9b57-71fed66ff4e2",
        "0cfcc788-b9e2-4c8c-a06b-8d365f33803e"
    ],
    "summary": "A set of ttps that checks for user groups and identifies the users home directory",
    "ordered": true
}' | json_pp
```

#### Modify an existing chain

You can modify an existing chain by sending an updated chain body to the `/chains/YourChainID` endpoint:

```bash
curl -X PUT -sk -H "Authorization: $TOKEN" -H 'Content-Type: application/json' "https://localhost:8888/v1/chain/51154993-dabe-4999-94a9-9e81b781ecd8" -d '{
    "name": "my_newer_adversary",
    "ttps": [
        "5c4dd985-89e3-4590-9b57-71fed66ff4e2",
        "0cfcc788-b9e2-4c8c-a06b-8d365f33803e",
        "b007fe0c-c6b0-4fda-915c-255bbc070de2"
    ],
    "summary": "A set of ttps that checks for user groups, identifies the users home directory, and copies the clipboard",
    "ordered": true,
}' | json_pp
```

#### Delete a chain

```bash
curl -X DELETE -sk -H "Authorization: $TOKEN" "https://localhost:8888/v1/chains/51154993-dabe-4999-94a9-9e81b781ecd8"
```

#### Schedule a chain for deployment

A cURL command for queueing an operation that runs the File Hunter chain against your home range. Note that the chain
ID is used (not name) in the URI:

```bash
curl -X POST -sk -H 'Authorization: "$TOKEN' -H 'Content-Type: application/json' "https://localhost:8888/v1/chain/File%20Hunter/schedule" -d
    '{"ranges": ["home"]}' | json_pp
```

Alternatively, if you want to select individual agents, swap "ranges" for "agents" and pass in specific agent names.

#### Optional: delay deployment

Using the schedule endpoint deploys the chain 10 seconds after the request is received. You can delay this by passing
an epoch time that you want the chain to run.
```bash
curl -X POST -sk -H 'Authorization: "$TOKEN' -H 'Content-Type: application/json' "https://localhost:8888/v1/chains/File%20Hunter/schedule" -d
    '{"agents": ["red", "blue", "green"]}, "epoch": 1708531792' | json_pp
```

#### Optional: add itinerary

You can link chains together through the itinerary argument. Pass in an ordered list of chain identifiers and they will
run one after the other, with a 10-second delay between.
```bash
curl -X POST -sk -H 'Authorization: "$TOKEN' -H 'Content-Type: application/json' "https://localhost:8888/v1/chain/File%20Hunter/schedule" -d
    '{"ranges": [home"]}, "itinerary": ["ransom note", "89f19f8d-f299-448c-81b3-9ba8c6ee67d2"]' | json_pp
```

### Agents

---

#### Get all Agents in Operator

```bash
curl -X GET -sk -H "Authorization: $TOKEN"  "https://localhost:8888/v1/agent" | json_pp
```

#### Get a specific Agent in Operator

```bash
curl -X GET -sk -H "Authorization: $TOKEN" "https://localhost:8888/v1/agent/test" | json_pp
```

#### Update an Agent's configuration

You can update your agent's configuration by passing it updated fields.

```bash
curl -X PUT -sk -H "Authorization: $TOKEN" -H 'Content-Type: application/json' "https://localhost:8888/v1/agent/test" -d '{
    "range": "new_range",
    "label": "new_agent_name"
}' | json_pp
```

#### Add multiple facts to an agent

You can add multiple facts to an agent by passing facts. Replace agent_name with the name of the agent.

```bash
curl -X POST -sk -H "Authorization: $TOKEN" "https://localhost:8888/v1/agent/agent_name/facts" -d '[{"key":"hello", "value":"world", "scope":"agent"},{"key":"fourth"}]' -H 'Content-Type: application/json'
```

### TTPs

---
#### Get all TTPs in Operator

```bash
curl -X GET -sk -H "Authorization: $TOKEN" "https://localhost:8888/v1/ttp" | json_pp
```

#### Get a specific TTP in Operator

```bash
curl -X GET -sk -H "Authorization: $TOKEN" "https://localhost:8888/v1/ttp/ff9bbd7f-871e-4db4-bedb-4e7a64a309bf" | json_pp
```

#### Create a new TTP in Operator

Create a new TTP by posting a TTP body to the endpoint:

```bash
curl -X POST -sk -H "Authorization: $TOKEN" -H 'Content-Type: application/json' "https://localhost:8888/v1/ttp" -d '{
    "id" : "ff9bbd7f-871e-4db4-bsdb-4e7a64a309bf",
    "name" : "Who Dat",
    "description" : "Get the current username",
    "tactic" : "discovery",
    "metadata" : {
        "version" : 1,
        "authors" : [
            "bartimus"
        ],
        "tags" : []
    },
    "technique" : {
        "id" : "T1082",
        "name" : "System Information Discovery"
    },
    "platforms" : {
        "darwin" : {
            "sh" : {
                "command" : "whoami"
            }
        }
    }
}'
```
#### Modify a TTP in Operator

```bash
curl -X PUT -sk -H "Authorization: $TOKEN" -H 'Content-Type: application/json' "https://localhost:8888/v1/ttp/ff9bbd7f-871e-4db4-bsdb-4e7a64a309bf" -d '{
    "name" : "Who is That",
    "metadata" : {
        "version" : 2,
        "authors" : [
            "bartimus"
        ],
        "tags" : []
    }
}'
```

#### Delete a TTP in Operator

```bash
curl -X DELETE -sk -H "Authorization: $TOKEN" "https://localhost:8888/v1/ttp/ff9bbd7f-871e-4db4-bsdb-4e7a64a309bf"
```

### Settings

---

#### Get Operator's Local Settings

```bash
curl -X GET -sk -H "Authorization: $TOKEN" "https://localhost:8888/v1/settings" | json_pp
```

---

#### Update Operator's Local Settings

```bash
curl -X PUT -sk -H "Authorization: $TOKEN" -H 'Content-Type: application/json' "https://localhost:8888/v1/settings" -d '{"token": "new_token_value"}' | json_pp
```

#### Upload a new payload

```bash
curl -X PUT -sk -H "Authorization: $TOKEN" "https://localhost:8888/v1/payload" -F upload=@payload.txt -X PUT
```