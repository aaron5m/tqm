**TQM** - working tiered architecture for:    
SRE  
Fronted  
Backend  
Data  

**Docker** keeps the project coherent and isolated (**VPC**).

SRE uses **nginx** (or other) outside of docker, only serves static, calls API.   
Frontend uses **React/Vite** to develop, builds to static, all inside docker.    
Backend coordinates through **node server.js** inside docker only exposed to localhost.  
Data builds models with **fastapi**, **postgres** stores under docker, fastapi to localhost.  

(Example project in repo is listing of shirts.)

```
                               INTERNET
                                   |
                                   v
                         +-------------------+
                         |       NGINX       |
                         |  Reverse Proxy /  |
                         |   Load Balancer   |
                         +-------------------+
                                   |
---- DOCKER CONTAINER SUBNET ------|-----------------------------------------|
                                   |
                 +-----------------+---------------+ <-------<-------              
                 |                                 |                 ^
                 v                                 v                 |
                                                                     |
       (Serves Static Frontend)             (API Traffic)            |
      +-----------------------+        +-----------------------+     ^
      |     Static HTML       |  --->  |        NodeJS         |     |
      |  Compiled Frontend    |  <---  |        Server         |     |
      +-----------------------+        +-----------------------+     |
               ^                                   ^                 |
               |                                   |                 ^
               |                                   |                 |
      +---------------------+            +----------------------+    |
      |  Frontend Dev Team  |   ---->    |  Backend Dev Team    |    |
      |  Builds frontend    |   <----    |  Develop Node APIs   |    ^
      +---------------------+            +----------------------+    |
                                                   |                 |
                                                   v                 |
                                         +-------------------+       | 
                                         |      FastAPI      | ----- >
                                         |     Data Team     |
                                         +-------------------+
                                                   ^
----- UNDER DOCKER ISOLATED -----------------------|-------------------------|
                                                   v
                                         +-------------------+
                                         |     PostgreSQL    |
                                         |      Database     |
                                         +-------------------+
```
