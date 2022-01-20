
# Operator API

#### Interact with the underlying Operator functionality

---

The Operator platform is built on top of an internal API. You can view all available endpoints by going to your
local Swagger website in your browser. To build on top of the API, either use the cURL examples given with each endpoint or use the built-in
`Requests.fetchOperator(endpoint, params)` function inside Operator, which communicates safely from JavaScript.
    
#### Example: Get a list of your chains over the API

```javascript
Requests.fetchOperator('/adversary', {
    method: 'GET',
    body: JSON.stringify({id: 'e9ae6305-96c3-4264-8e7d-4b20f9355eca'})
}).then(res => res.json()).then(res => { console.log(res); });
```
    
Your API key, found in the network settings, is used to authenticate your API requests. Use this as an
Authorization header for each request if not using the Requests.fetchOperator function. If you use the Requests.fetchOperator function, this key
is automatically applied. The key changes on each restart of Operator, unless using headless mode, where you can set it via
a parameter.

### SSL

---

The internal API uses a self-signed certificate by default, as it is only accessible on localhost. Since
you own both sides of the connection (client and server) we are optimizing for preventing network sniffing, 
not trust between the client and server.
