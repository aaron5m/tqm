# vnFM Alpine VPC in a Box

**A slim VPC environment for small role-based teams, designed to test cohesion, workflow, and architectural thinking before heading into full-scale production.**  

This project builds with **docker** a lightweight mirror of subnets in a cloud VPC — public, private, and isolated — while providing a fast and flexible development workflow for frontend, backend, architecture, and data roles.

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
| Subnet / Layer       | Role / Responsibility        | Technology Stack   | Notes                        |
|----------------------|------------------------------|--------------------|------------------------------|
| Public Release       | Site Reliability Developer   | Nginx (or similar) | Serves static to external    |
| Public Beta          | Frontend Developer           | React, Vite        | Hot reload, live development |
| Private Subnet       | Backend Developer            | Node.js, FastAPI   | Internal API connections     |
| Isolated Subnet      | Data Developer               | Postgres, SQLModel | Persistent, model-driven     |
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

1. SRE forks this repo and mocks up localhost .env for team (e.g. email)
2. Frontend, Backend, and Data use docker and git pull/push/merge to coordinate local build, while
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
cp vnfm/* /var/www/
```

2. Cd in and rename the .env.template file, for example
```
cd /var/www
mv .env.template .env
```

3. Modify the variables without initial values (here marked *) in .env to (random) strings
```
POSTGRES_USER=*
POSTGRES_PASSWORD=*
POSTGRES_DB=*
JWT_SECRET=*
VITE_PASS_URL=""
API_SECRET=*
VERIFICATION_REQUIRED=0
```
 - VITE_PASS_URL should be your domain name if you are going into production (https//yoursite.com)
 - VERIFICATION_REQUIRED should be 1 if you are going into production  
   - you will need to add your own method for verification (e.g. email a link)
   - (you can manually verify with `docker compose exec node node admin.js verify $username`)


4. Compose with docker and apply alembic migrations, for example
```
docker compose up -d --build
docker compose exec fastapi alembic upgrade head
```

5. Add the reverse proxy to your server, for example with nginx, in /etc/nginx/sites-enabled/yoursite.conf
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

6. Make sure your server is up, for example
`systemctl reload nginx`

7. You may develop the frontend from the local machine with
```
cd frontend
npm install
npm run dev
```

---

## Next Steps / Enhancements

- Add automated email verification for new users via Node.js or external service.  
- Automate `.env` generation for API secrets, database credentials, and public IP.  
- Extend admin tooling for toggling environment flags (e.g., `VERIFICATION_REQUIRED`).  
- Optional: Terraform or cloud deployment scripts for full Alpine VPC emulation.

---

This project is designed for **small, adept, role-based teams** to test cohesion, experiment with separation of concerns, and practice end-to-end DevOps workflows in a contained “Alpine VPC” environment.