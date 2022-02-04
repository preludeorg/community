
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

--- 

#### Get all chains loaded in Operator
```
curl -X GET -H $TOKEN -sk "https://localhost:8888/v1/chains" | json_pp
```

#### Get a specific chain by identifier
```
curl -X GET -H $TOKEN -sk "https://localhost:8888/v1/chains/printnightmare" | json_pp
```


