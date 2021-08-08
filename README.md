
# simple-kong-docker-API-gateway

A basic API gateway serving both internal and services - built with **Kong**, **Docker**, &amp; **PostgreSQL**


# Setup
- Install Docker from [here](https://docs.docker.com/engine/install/ubuntu/) if you don't have it already

- Install docker-compose as well

```sh
apt install docker-compose
```
- clone the repo
```sh
git clone https://github.com/rafian-git/simple-kong-docker-API-gateway.git
```

## Run the project

- change directory into project folder  
```sh
cd simple-kong-docker-API-gateway
```
- start the project running docker-composer 
```sh
docker-compose up -d
```
Note that the  _**-d**_  flag will running the containers as a background process. The compose file does 4 things:

1.  Creates PostgreSQL container as a backend data store (configuration info) for Kong .
2.  Creates an ephemeral to initialize the Postgres database.
3.  Builds a container for the Hello world Node.js microservice.
4.  Runs the Kong API Gateway as a container.

## Verify

- Verify by checking running containers

```sh
docker ps
```
- Verify if the Kong Gateway and Admin API are responding:

```sh
curl http://localhost:8000
curl http://localhost:8001
```
- To get the list of all available Admin API endpoints:

```sh
curl http://localhost:8001/endpoints
```

##  Creating an external Service Proxy

Now, create a local service and name it anything with hyphen separated words like  _**your-service-name**_. We will forward our requests to our external service(hosted in another remote machine). For the sake of this project we will consider a public API as our external service. You'll find a lot of public APIs to play with [here](https://api.publicapis.org/entries) or [here](https://apipheny.io/free-api/). We will be using [catfact.ninja](https://catfact.ninja) in this project. This is a two part process as both the service and then the route must be established like so:
```
curl -i -X POST --url http://localhost:8001/services/ --data 'name=your-service-name' --data 'url=https://catfact.ninja/'
curl -i -X POST --url http://localhost:8001/services/your-service-name/routes --data 'hosts[]=your-service-name'
```
You can now test both the plubic API and the proxied service using cURL:

```
curl https://catfact.ninja/breeds
curl http://localhost:8000/breeds --header 'your-service-name'
```
Both will return the same result if you've done it right.
> you can directly hit http://server-public-ip-address:8000/breeds instead of using _**curl**_ if you're running it on a virtual server with public IP. 

##  Setting up an internal Service
#### The Hello World NodeJS app
Following the recipe above, we can build an endpoint for the Node.js microservice:

```sh
curl -i -X POST --url http://localhost:8001/services/ --data 'name=hello-world-service' --data 'url=http://kong-app:3000'
curl -i -X POST --url http://localhost:8001/services/hello-world-service/routes --data 'hosts[]=hello-world-service'
```

Remember that this service is running in the  _kong-app_  container and is exposed to the isolated Docker network via port 3000 but callers cannot access it without going through the API gateway. We can reach the  _**hello-world-service**_  using the  _Host_  header just like the previous one:
```
curl http://localhost:8000 --header 'Host: hello-world-service'
```

Use the below endpoint to see a list of all the services enabled so far:

```
curl http://localhost:8001/services
```
## Enable Rate Limiting

Adding rate limiting (a maximum of 5 requests per minute in this case) to a service is as simple as running a single command:

```
curl -X POST http://localhost:8001/services/hello-world-service/plugins/ --data "name=rate-limiting" --data "config.minute=5" --data "config.policy=local"

```

If you hit the  _hello-world-service_  endpoint again, you will see additional headers in the response indicating the rate limit. Hit it more than 5 times to check if the plugin is working

```
curl http://localhost:8000 --header 'Host: hello-world-service'
```
You'll find a lot of ready plugins [here](https://konghq.com/products/kong-gateway/kong-plugins/)
## Add Authorization

Key-based authorization can be add to the  _hello-world-service_  endpoint by enabling the  _**key-auth**_  plugin, creating a user (_QA_  in this example) and then providing the access key:

```
curl -i -X POST --url http://localhost:8001/services/hello-world-service/plugins/ --data 'name=key-auth'
curl -i -X POST --url http://localhost:8001/consumers/ --data "username=QA"
curl -i -X POST --url http://localhost:8001/consumers/QA/key-auth/ --data 'key=Hello_Kong!'

```

Test the  _time-service_  endpoint both with and without specifying an API key:

```
curl http://localhost:8000 --header 'Host: hello-world-service'
curl http://localhost:8000 --header 'Host: hello-world-service' --header "apikey: Hello_Kong!"
```
## Conclusion

& you're done! Find out more if you want - [Docs](https://docs.konghq.com/gateway-oss/)