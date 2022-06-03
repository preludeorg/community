# Operator API

#### Interact with underlying Operator functionality

---

The Operator platform is built on top of an internal API.


### SSL

---

The internal API uses a self-signed certificate by default, as it is only accessible on localhost. Since
you own both sides of the connection (client and server), we are optimizing for preventing network sniffing, 
not trust between the client and server.

#### Custom SSL certificates

---

You can install custom SSL certificates by creating a `configs` directory in your workspace folder (portal.prelude.org folder)
and dropping a `key.pem` and `cert.pem` into the folder. Once you restart Operator, the new certificates will be loaded.
 
### Authentication 

---

The API requires a token to be passed with the request. Your token can be found in:
Operator -> Settings -> Network -> Token. Set the variable $TOKEN to your token.

> If you are using the Headless version of Operator, your token can be found in the settings.yml file that is generated when you first start the application.

## Endpoints 

### Chains

---

#### Get all chains loaded in Operator

```bash
curl -X GET -sk -H "Authorization: $TOKEN" "https://localhost:8888/v1/chain" | json_pp
```

#### Get a specific chain by identifier

To retrieve user created chains simply add the desired chain's ID to the `/chain/YourChainID` endpoint.

```bash
curl -X GET -sk -H "Authorization: $TOKEN" "https://localhost:8888/v1/chain/File%20Hunter" | json_pp
```

#### Create a new chain

```bash
curl -X POST -sk -H "Authorization: $TOKEN" -H "Content-Type: application/json" "https://localhost:8888/v1/chain" -d "{
    \"name\": \"my_new_adversary\",
    \"ttps\": [
        \"5c4dd985-89e3-4590-9b57-71fed66ff4e2\",
        \"0cfcc788-b9e2-4c8c-a06b-8d365f33803e\"
    ],
    \"summary\": \"A set of ttps that checks for user groups and identifies the users home directory\",
    \"ordered\": true
}"
```

#### Modify an existing chain

You can modify an existing chain by sending an updated chain body to the `/chain/YourChainID` endpoint:

```bash
curl -X PUT -sk -H "Authorization: $TOKEN" -H "Content-Type: application/json" "https://localhost:8888/v1/chain/51154993-dabe-4999-94a9-9e81b781ecd8" -d "{
    \"name\": \"my_newer_adversary\",
    \"ttps\": [
        \"5c4dd985-89e3-4590-9b57-71fed66ff4e2\",
        \"0cfcc788-b9e2-4c8c-a06b-8d365f33803e\",
        \"b007fe0c-c6b0-4fda-915c-255bbc070de2\"
    ],
    \"summary\": \"A set of ttps that checks for user groups, identifies the users home directory, and copies the clipboard\",
    \"ordered\": true
}" | json_pp
```

#### Delete a chain

You can delete an existing chain by inputting the desired chain's ID to the `/chain/YourChainID` endpoint:

```bash
curl -X DELETE -sk -H "Authorization: $TOKEN" "https://localhost:8888/v1/chain/51154993-dabe-4999-94a9-9e81b781ecd8"
```

#### Schedule a chain for deployment

A cURL command for queueing an operation that runs the File Hunter chain against your selected agent. Note that the chainID is used (not name) in the URI:

```bash
curl -X POST -sk -H "Authorization: $TOKEN" -H "Content-Type: application/json" "https://localhost:8888/v1/schedule" -d "{
    \"agents\": [\"agent_name\"],
    \"ttps\": [\"90c2efaa-8205-480d-8bb6-61d90dbaf81b\"], 
    \"ordered\": false}"
```

Alternatively, if you want to select multiple agents pass in additional agent names.

#### Optional: delay deployment

Using the schedule endpoint deploys the chain 10 seconds after the request is received. You can delay this by passing an epoch time that you want the chain to run.

```bash
curl -X POST -sk -H "Authorization: $TOKEN" -H "Content-Type: application/json" "https://localhost:8888/v1/schedule" -d "{
    \"agents\": [\"agent_name\"],
    \"ttps\": [\"90c2efaa-8205-480d-8bb6-61d90dbaf81b\"],
    \"epoch\": \"1647441487467\", 
    \"ordered\": false}"
```

Alternatively, if you want to select multiple agents pass in additional agent names.

### Agents

---

#### Get all Agents in Operator

```bash
curl -X GET -sk -H "Authorization: $TOKEN"  "https://localhost:8888/v1/agent" | json_pp
```

#### Get a specific Agent in Operator

You can retrieve a specific agent by appending the agent's name to the `/agent/YourAgentName` endpoint. Ensure you are passing the agent's name, not label, to the endpoint.

```bash
curl -X GET -sk -H "Authorization: $TOKEN" "https://localhost:8888/v1/agent/test" | json_pp
```

#### Update an Agent's configuration

You can modify an existing agent by sending an updated agent body to the `/agent/YourAgentName` endpoint.

```bash
curl -X PUT -sk -H "Authorization: $TOKEN" -H "Content-Type: application/json" "https://localhost:8888/v1/agent/test" -d "{
    \"label\": \"new_agent_name\"
}" | json_pp
```

#### Add multiple facts to an agent

You can add multiple facts to a desired agent by passing a fact body to the `/agent/YourAgentName` endpoint.

```bash
curl -X POST -sk -H "Authorization: $TOKEN" "https://localhost:8888/v1/agent/YourAgentName/facts" -d "[{\"key\":\"hello\", \"value\":\"world\", \"scope\":\"agent\"}, {\"key\":\"fourth\"}]" -H "Content-Type: application/json"
```

### TTPs

---

#### Get all TTPs in Operator

```bash
curl -X GET -sk -H "Authorization: $TOKEN" "https://localhost:8888/v1/ttp" | json_pp
```

#### Get a specific TTP in Operator

Retrieve a specific TTP by appending the desired TTP's ID to the `/ttp/ttpID` endpoint.

```bash
curl -X GET -sk -H "Authorization: $TOKEN" "https://localhost:8888/v1/ttp/ff9bbd7f-871e-4db4-bedb-4e7a64a309bf" | json_pp
```

#### Create a new TTP in Operator

Create a new TTP by posting a TTP body to the endpoint:

```bash
curl -X POST -sk -H "Authorization: $TOKEN" -H "Content-Type: application/json" "https://localhost:8888/v1/ttp" -d "{
    \"id\" : \"ff9bbd7f-871e-4db4-bsdb-4e7a64a309bf\",
    \"name\" : \"Who Dat\",
    \"description\" : \"Get the current username\",
    \"tactic\" : \"discovery\",
    \"metadata\" : {
        \"version\" : 1,
        \"authors\" : [
            \"bartimus\"
        ],
        \"tags\" : []
    },
    \"technique\" : {
        \"id\" : \"T1082\",
        \"name\" : \"System Information Discovery\"
    },
    \"platforms\" : {
        \"darwin\" : {
            \"sh\" : {
                \"command\" : \"whoami\"
            }
        }
    }
}"
```

#### Modify a TTP in Operator

You can modify an existing TTP by sending an updated TTP body to the `/ttp/ttpID` endpoint.

```bash
curl -X PUT -sk -H "Authorization: $TOKEN" -H "Content-Type: application/json" "https://localhost:8888/v1/ttp/ff9bbd7f-871e-4db4-bsdb-4e7a64a309bf" -d "{
    \"name\" : \"Who is That\",
    \"metadata\" : {
        \"version\" : 2,
        \"authors\" : [
            \"bartimus\"
        ],
        \"tags\" : []
    }
}"
```

#### Delete a TTP in Operator

You can delete an existing TTP by inputting the desired TTP's ID to the `/ttp/ttpID` endpoint.

```bash
curl -X DELETE -sk -H "Authorization: $TOKEN" "https://localhost:8888/v1/ttp/ff9bbd7f-871e-4db4-bsdb-4e7a64a309bf"
```

### Payloads

---

#### List available payloads

A cURL command for listing the local payloads in Operator.

```bash
curl -sk -H "Authorization: $TOKEN" "https://localhost:8888/v1/payload"
```

#### Upload a new payload

A cURL command for uploading local payloads to Operator. Note that you must be in the location of the file prior to sending the request.

```bash
curl -X PUT -sk -H "Authorization: $TOKEN" "https://localhost:8888/v1/payload" -F upload=@payload.txt -X PUT
```

### Plugins

---

Note that plugin names are case-sensitive.

#### Get all installed plugins

```bash
curl -X GET -sk -H "Authorization: $TOKEN" "https://localhost:8888/v1/plugin"
```

#### Get specific plugin configuration file

```bash
curl -X GET -sk -H "Authorization: $TOKEN" "https://localhost:8888/v1/plugin/HTTPS"
```

### Other

---

#### Get local settings

```bash
curl -X GET -sk -H "Authorization: $TOKEN" "https://localhost:8888/v1/settings"
```
