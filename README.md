# vnFM Alpine VPC in a Box

**A slim VPC environment for small role-based teams, designed to improve cohesion, workflow, and architectural thinking before heading into full-scale production.**  

This project builds with **docker** a lightweight mirror of subnets in a cloud VPC — public, private, and isolated — while providing a fast and flexible development workflow for frontend, backend, architecture, and data roles.

---

**Requirements:** Docker, A Server (nginx)

---

## Architecture Overview

```
                               INTERNET
                                   |
                                   v  SRE Team
                         +-------------------+
                         |  NGINX (or other) |
                         |  Reverse Proxy /  |
                         |   Load Balancer   |
                         +-------------------+
                                   |
---- DOCKER CONTAINER SUBNET ------|-----------------------------------------|
                                   |
                ------->----->-----^--------<--------<-------<-------              
               ^                                   |                 ^
               |                                   v                 |
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
      |  Builds Frontend    |   <----    |  Develop Node APIs   |    ^
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

## Working Example Suite

This repository includes a **fully functional onboarding suite** to give your team something to build on quickly:

- **User Signup/Signin/Signout**: Lightweight example with manual verification via `admin.js`.
- **Upload Links**: Users can submit:
  - Title
  - URL
  - Description
  - Two images (front/back)
- **Front-to-Back Flow**: Demonstrates the flow through all subnet layers:
  - Frontend → Node.js → FastAPI → Postgres
- **Role-Oriented Testing**: Allows frontend, backend, API, and database roles to practice cohesion and workflow while interacting with a real application.

---

### Key Concepts

- **Public Release (e.g. Nginx)**: Serves static frontend builds from the `html/` folder. Acts as the public-facing entry point.  
- **Public Beta (React/Vite)**: Supports live frontend development with hot module reload. Can run inside or outside Docker; depends on Node backend for database interactions.  
- **Private Subnet (Node.js)**: The gateway for all database-altering requests. Enforces internal API separation and business logic rules.  
- **Semi-Isolated Subnet (FastAPI)**: Provides read-only access to the database for server-proxied-localhost queries; all writes must go through Node.js.  
- **Isolated Data Subnet (Postgres)**: Fully isolated database layer, persistent via mounted volumes, accessible only through FastAPI models.

This separation enables small teams to experiment with **role-based responsibilities** and **subnet isolation**, simulating for development a spirit like that of Alpine mountaineering teammates - responsive, agile, coordinated, competent.

---

## Role-Based Workflow

```
| Subnet / Layer  | Role / Responsibility      | Technology Stack   | Notes                        |
|-----------------|----------------------------|--------------------|------------------------------|
| Public Server   | Site Reliability Developer | Nginx (or similar) | Serves static to external    |
| Public Beta     | Frontend Developer         | React, Vite        | Hot reload, live development |
| Private Subnet  | Backend Developer          | Node.js, FastAPI   | Internal API connections     |
| Isolated Subnet | Data Developer             | Postgres, SQLModel | Persistent, model-driven     |
```
---

## Development-Roles Workflow

1. **Site Reliability Development**  
   - Nginx (or similar) serves the production-ready frontend.  
   - Node.js and FastAPI remain accessible only through localhost, preserving internal isolation.
   - Write the proxy-passes (for example in nginx.conf) for
     - node (/api/ 127.0.0.1/api/)
     - FastAPI (/pyapi/ 127.0.0.1/pyapi).

2. **Frontend Development**  
   - Run `npm run dev` inside the frontend directory.  
   - Iterate on React/Vite with hot reload.  
   - When ready, run a full Docker rebuild to generate the static HTML build for server.

3. **Backend Development**  
   - Node.js handles business logic, writes to FastAPI, and enforces internal API rules.  

4. **Data Development**  
   - Build out SQLModels in FastAPI (python).
   - Apply models to Postgres with Alembic --autogenerate and upgrade head

---
```
        /\
       /  \
      /    \    /\
     /      \  /  \
    /  /\    \/    \
   /  /  \           \
  /__/____\___________\
 vnFM Alpine VPC in a Box
```
## Spin-up A Small Team

1. SRE forks this repo and (optionally) sets up .env for UNSAFE http-only mode on the server
2. Frontend, Backend, and Data use docker and git pull/push/merge to coordinate local (or UNSAFE) build, while
3. SRE readies server with proxy rules, listeners, verification methods, and live .env

**vnFM serves as a sandbox challenge for a new team to quickly flesh out**:

- **Architectural awareness:** Emulates public, private, and isolated subnet strategies.  
- **Team role clarity:** Frontend, backend, architecture, and data responsibilities are clear yet integrated.  
- **Security and isolation:** Node.js enforces write access; FastAPI is read-only externally.  
- **Feedback agility:** Vite live reload, Dockerized services, hot-rebuild to static assets.  
- **Data conveyance and modeling:** SQLModel with Postgres must be meaningfully and safely shipped.

---

## Instructions (to see the example onboarding suite)

1. Clone the repo and copy its contents into a local folder  
or into the parent of your server's `html` folder, for example
```
git clone https://github.com/aaron5m/vnfm
cp vnfm/. /var/www/
```

2. Cd in and rename the .env.template file to .env, for example
```
cd /var/www
mv .env.template .env
```

3. Modify the variables without initial values (here marked *) in .env to (random) strings
```
POSTGRES_USER=vnFMuser*
POSTGRES_PASSWORD=vnFMpassword*
POSTGRES_DB=vnFMdb*
JWT_SECRET=vnFMjwt*
VITE_PASS_URL=""
API_SECRET=vnFMapi*
VERIFICATION_REQUIRED=0
```
 - VITE_PASS_URL=https://your.domain if you are going into production
 - VITE_PASS_URL=http://your.domain if you are going UNSAFE http-only on the server
 - VERIFICATION_REQUIRED should be 1 if you are going into production  
   - you will need to add your own method for verification (e.g. email a link)
   - (you can manually verify with `docker compose exec node node admin.js verify $username`)


4. There three modes SANDBOX, UNSAFE-HTTP-ONLY, and PRODUCTION

5. To run in SANDBOX on your local machine, compose http-only-nginx profile with docker and apply alembic migrations, for example
```
docker compose --profile http-only-nginx up -d --build
docker compose exec fastapi alembic upgrade head
```

6. To run UNSAFE on a server, using only http on port 80, with nginx inside docker, change the .env file `VITE_PASS_URL=http://your.domain` and then
```
docker compose --profile http-only-nginx up -d --build
docker compose exec fastapi alembic upgrade head
```

7. If you develop with Vite while running UNSAFE on a server you must
```
cd frontend
npm install
VITE_PASS_URL=http://your.domain npm run dev
```

8. If you are going into PRODUCTION change the .env file `VITE_PASS_URL=https://your.domain` and then
```
docker compose up -d --build
docker compose exec fastapi alembic upgrade head
```

9. If you are going into PRODUCTION, you must set up your own server and configure the reverse proxy to reach node and fastapi, for example with nginx, in /etc/nginx/sites-enabled/yoursite.conf
```
    # copy all this into the end of your server { ... here! } block
    # Node backend 
    location /api/ {
        proxy_pass http://127.0.0.1:3000/api/;     
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Python backend
    location /pyapi/ {
        proxy_pass http://127.0.0.1:8000/pyapi/;     
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
```

10. Make sure your server is up, for example
`systemctl reload nginx`

11. In PRODUCTION you may also develop beta with Vite, but it is always http (unsafe)
```
cd frontend
npm install
VITE_PASS_URL=https://your.domain npm run dev
```

---

## Next Steps / Enhancements

- Add automated email verification for new users via Node.js or external service.  
- Automate `.env` generation for API secrets, database credentials, and public IP.  
- Extend admin tooling for toggling environment flags (e.g., `VERIFICATION_REQUIRED`).  
- Optional: Terraform or cloud deployment scripts for full Alpine VPC emulation.

---

## Known Issues

Sometimes the nginx in http-only-nginx UNSAFE mode, does not want to stop.  
Try `docker-compose exec nginx nginx -s stop` and wait a breath, then `docker-compose down`.

Sometimes previous builds will interfere with a re-build of fastapi and its SQLmodels. If rebuilding, best to clear everything out from the before, with tools such as `docker system prune` etc.

When switching modes between SANDBOX, UNSAFE, and PRODUCTION docker will sometimes keep the old values of the .env file, even after you've updated it. First re-build with no cache. Then use `--build` as you go up. Reload your server.

---

This project is designed for **small, adept, role-based teams** to test cohesion, experiment with separation of concerns, and practice end-to-end DevOps workflows in a contained “Alpine VPC” environment.