
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
Operator -> Settings -> Network -> Token. In the following commands replace
`$TOKEN` with `'Authorization: YOURTOKEN'`


## Endpoints 

---

### Chains

---
#### Get all chains loaded in Operator
```
curl -X GET -sk -H $TOKEN  "https://localhost:8888/v1/chains" | json_pp
```
#### Get a specific chain by identifier
```
curl -X GET -sk -H $TOKEN  "https://localhost:8888/v1/chains/printnightmare" | json_pp
```
#### Create a new chain

#### Modify an existing chain

#### Delete a chain

### Agents

---
#### Get all Agents in Operator
```
curl -X GET -sk -H $TOKEN  "https://localhost:8888/v1/agents" | json_pp
```
#### Get a specific Agent in Operator
```
curl -X GET -sk -H $TOKEN "https://localhost:8888/v1/agents/test" | json_pp
```
#### Update an Agent's configuration

### TTPs

---
#### Get all TTPs in Operator
```
curl -X GET -sk -H $TOKEN "https://localhost:8888/v1/ttps" | json_pp
```
#### Get a specific TTP in Operator
```
curl -X GET -sk -H $TOKEN "https://localhost:8888/v1/ttps/ff9bbd7f-871e-4db4-bedb-4e7a64a309bf" | json_pp
```
#### Create a new TTP in Operator

#### Modify a TTP in Operator

#### Delete a TTP in Operator

### Operations

---
#### Send Operation(s) to an agent in Operator

An operation will task an agent to run TTP(s).

The simplest type of operation looks like this:
```
[
    {
        "name": "operation_one",
        "ttp": "ff9bbd7f-871e-4db4-bedb-4e7a64a309bf",
    }
]
```
An operation can take an **OPTIONAL** list of facts with this optional field an operation would look like this:
```
[
    {
        "name": "operation_two",
        "ttp": "ff9bbd7f-871e-4db4-bedb-4e7a64a309bf",
        "facts": [{"fact1_name": "fact1_value"}, {"fact2_name": "fact2_value"}]
    }
]
```
You can queue up multiple Operations by adding them to the array.
```
[
    {
        "name": "operation_one",
        "ttp": "ff9bbd7f-871e-4db4-bedb-4e7a64a309bf",
    },
    {
        "name": "operation_two",
        "ttp": "ff9bbd7f-871e-4db4-bedb-4e7a64a309bf",
    }
]
```
A cURL command for queueing two operations:
```
curl -X POST -sk -H $TOKEN -H 'Content-Type: application/json' "https://localhost:8888/v1/operations/AgentName" -d '[
    {
    "name": "operation_two",
    "ttp": "5c4dd985-89e3-4590-9b57-71fed66ff4e2",
    "facts": []
    },
    {
    "name": "operation_three",
    "ttp": "0cfcc788-b9e2-4c8c-a06b-8d365f33803e",
    "facts": []
    }
]'| json_pp
```

### Settings

---
#### Get Operator's Local Settings
```
curl -X GET -sk -H $TOKEN "https://localhost:8888/v1/settings" | json_pp
```
---
#### Update Operator's Local Settings
```
curl -X PUT -sk -H $TOKEN -H 'Content-Type: application/json' "https://localhost:8888/v1/settings" -d '{"token": "new_token_value"}' | json_pp
```

### Command

---
#### Run a command on the Operator host machine
```
curl -X POST -sk -H $TOKEN -H 'Content-Type: application/json' "https://localhost:8888/v1/command" -d '{"command": "ifconfig"}' | json_pp
```

---
