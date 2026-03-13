**TAQM** - working architecture for:  

SRE  
Fronted  
Backend  
Data  

**Docker** keeps the project coherent and isolated (**VPC**).

Frontend uses **React/Vite** to develop, builds to static, all inside docker.
SRE uses **nginx** (or other) outside of docker, only serves Frontend's static, calls API.
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
                 +-----------------+-----------------+ <----<--------              
                 |                                   |               ^
                 v                                   v               |
                                                                     |
        (Serves Static Frontend)             (API Traffic)           |
      +-----------------------+        +-----------------------+     ^
      |   NGINX Static HTML   |  --->  |    NodeJS Instances    |    |
      |  Compiled Frontend    |  <---  |  (Multiple Containers) |    |
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
                                         |    Not directly   |
                                         |  internet exposed |
                                         +-------------------+
```
