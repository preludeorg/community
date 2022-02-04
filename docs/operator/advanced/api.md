
# Operator API

#### Interact with the underlying Operator functionality

---

The Operator platform is built on top of an internal API.

## Configuration 

### SSL

---

The internal API uses a self-signed certificate by default, as it is only accessible on localhost. Since
you own both sides of the connection (client and server) we are optimizing for preventing network sniffing, 
not trust between the client and server.

### Authentication 

--- 

Your API token, found in the network settings, is used to authenticate your API requests. Use this as an
Authorization header for each request.

## Endpoints 

### Chains

#### Get all chains loaded in Operator
```
curl -X GET -H $TOKEN -sk "https://localhost:8888/v1/chains" | json_pp
```
#### Get a specific chain by identifier
```
curl -X GET -H $TOKEN -sk "https://localhost:8888/v1/chains/printnightmare" | json_pp
```
#### Create a new chain

#### Modify an existing chain

#### Delete a chain

--- 

### Agents
#### Get all Agents in Operator
```
curl -X GET -H $TOKEN -sk "https://localhost:8888/v1/agents" | json_pp
```
#### Get a specific Agent in Operator
```
curl -X GET -H $TOKEN -sk "https://localhost:8888/v1/agents/test" | json_pp
```
#### Update an Agent's configuration

---

### Procedures (TTPs)

#### Get all procedures (TTPs) in Operator
```
curl -X GET -H $TOKEN -sk "https://localhost:8888/v1/procedures" | json_pp
```
#### Get a specific procedure (TTP) in Operator
```
curl -X GET -H $TOKEN -sk "https://localhost:8888/v1/procedures/ff9bbd7f-871e-4db4-bedb-4e7a64a309bf" | json_pp
```
#### Create a new procedure (TTP) in Operator

#### Modify a chain in Operator

#### Delete a chain in Operator

---

### Operations

#### Create an operation in Operator
```
curl -X GET -H $TOKEN -sk  | json_pp
```

---

### Settings

#### Get Operator's Settings
```
curl -X GET -H $TOKEN -sk "https://localhost:8888/v1/settings" | json_pp
```
---
#### Update Operator's Settings


### Command

#### Run a command on the Operator host machine
```
curl -X GET -H $TOKEN -sk  | json_pp
```

---
