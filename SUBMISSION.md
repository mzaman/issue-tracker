# Project Submission Document

## Project Overview

This repository contains a robust Issue Tracking RESTful API backend built using Node.js and Koa framework, backed by a MySQL database managed through Sequelize ORM. The entire system is containerized using Docker and designed for seamless environment management, including development, testing, and production setups.

---

## Features

- REST API adhering to best practices (proper HTTP methods, status codes, and JSON responses).
- Sequelize ORM with migration and seeder support.
- Multi-environment Docker Compose configuration supporting `.env.dev`, `.env.test`, `.env.prod`.
- Automated MySQL initialization with SQL scripts.
- Comprehensive bash scripts for managing Docker containers and project lifecycle.
- Swagger UI integration for interactive API documentation at `localhost:5555`.
- Detailed Postman collection to test all API endpoints effortlessly.
- Modular and scalable project structure.


## Prerequisites
Before you begin using this project, you need to ensure that your system meets the following preinstallation requirements:

- Docker & Docker Compose installed
- Bash shell available
- Git installed
- SSH access if cloning a private repository

## 1. **Docker**

This project relies on Docker to create and manage containers. You need to have Docker installed on your machine.

- **Docker Engine**: The core component for running containers.
- **Docker Compose**: Used to define and run multi-container Docker applications.

### Installing Docker
You can download Docker based on your operating system:
- [Docker for Mac](https://www.docker.com/products/docker-desktop)
- [Docker for Windows](https://www.docker.com/products/docker-desktop)
- [Docker for Linux](https://docs.docker.com/engine/install/)

#### Verify Installation:
After installation, you can verify if Docker and Docker Compose are installed correctly by running:
```bash
docker --version
docker-compose --version
```

> **Note**: Docker Desktop comes with Docker Compose preinstalled, so you don’t need to install it separately on macOS and Windows. On Linux, you might need to install it manually.

## 2. **Docker Compose**

This project uses Docker Compose to manage multiple Docker containers. You need to have Docker Compose installed on your machine.

### Installing Docker Compose
You can download Docker Compose based on your operating system:
- [Docker Compose for Mac](https://docs.docker.com/desktop/setup/install/mac-install/)
- [Docker Compose for Windows](https://docs.docker.com/desktop/setup/install/windows-install/)
- [Docker Compose for Linux](https://docs.docker.com/desktop/setup/install/linux/)

#### Verify Installation:
After installation, you can verify if Docker Compose is installed correctly by running:

```bash
docker-compose --version
```

## 3. System Requirements
- **Linux**: Any supported Linux distribution (e.g., Ubuntu).
- **macOS**: Docker Desktop for macOS.
- **Windows**: Docker Desktop for Windows, with WSL 2 enabled.

## 4. RAM and CPU
- A minimum of 4 GB of RAM is recommended.
- Docker uses CPU resources to manage containers, so ensure your machine has adequate resources.

## Folder Structure & Description

| Path                          | Purpose                                                         |
|-------------------------------|-----------------------------------------------------------------|
| `cmd/`                        | Executable shell scripts to install, start, stop, rebuild, etc. |
| `docker-entrypoint-initdb.d/` | SQL scripts run on MySQL container first start for schema setup |
| `config/config.js`            | Sequelize config reading environment variables                  |
| `lib/api/`                   | Koa route handlers for endpoints                                |
| `lib/models/`                 | Sequelize models and DB connection                              |
| `migrations/`                 | Database migration files for schema changes                     |
| `seeders/`                    | Seeder files for initial and test data                          |
| `.env.dev`, `.env.test`, `.env.prod` | Environment variable files for respective environments           |
| `swagger.js`                  | Swagger setup with API docs configuration                      |
| `docker-compose.yml`          | Docker Compose multi-service setup with env file support       |
| `Dockerfile`                  | Docker image build instructions                                 |
| `package.json`                | Node.js dependencies and useful npm scripts                    |
| `SUBMISSION.md`               | This detailed project documentation                            |

## Project Structure
```
.
├── cmd
│   ├── app
│   ├── down
│   ├── env
│   ├── exec
│   ├── install
│   ├── rebuild
│   ├── reinstall
│   ├── restart
│   ├── start
│   ├── stop
│   ├── token
│   └── watch
├── config
│   ├── config.js
│   └── index.js
├── docker-compose.dev.yml
├── docker-compose.override.yml
├── docker-compose.prod.yml
├── docker-compose.test.yml
├── docker-compose.yml
├── docker-entrypoint-initdb.d
│   └── 1_create_table.sql
├── Dockerfile
├── index.js
├── jest.config.js
├── migrations
│   ├── 20230522-create-users.js
│   ├── 20250520215239-create-issues-table.js
│   └── 20250520216818-create-revisions-table.js
├── package-lock.json
├── package.json
├── README.md
├── seeders
│   ├── 20230519-seed-users.js
│   ├── 20230520-seed-issues.js
│   ├── 20230521-seed-revisions.js
│   └── 20230522-seed-revisions-bulk.js
├── src
│   ├── controllers
│   │   ├── v1
│   │   │   ├── auth.js
│   │   │   ├── discovery.js
│   │   │   ├── health.js
│   │   │   └── issues.js
│   │   └── v2
│   │       ├── auth.js
│   │       ├── discovery.js
│   │       ├── health.js
│   │       └── issues.js
│   ├── middleware
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── models
│   │   ├── connection.js
│   │   ├── issue.js
│   │   ├── revision.js
│   │   └── user.js
│   ├── routes
│   │   ├── index.js
│   │   ├── v1
│   │   │   ├── auth.js
│   │   │   ├── discovery.js
│   │   │   ├── health.js
│   │   │   ├── index.js
│   │   │   └── issues.js
│   │   └── v2
│   │       ├── auth.js
│   │       ├── discovery.js
│   │       ├── health.js
│   │       ├── index.js
│   │       └── issues.js
│   └── utils
│       ├── generateToken.js
│       └── responses.js
├── SUBMISSION.md
├── swagger-server.js
├── swagger.yaml
├── test
│   ├── auth.controller.test.js
│   ├── auth.test.js
│   ├── discovery.test.js
│   ├── health.test.js
│   ├── issues.integration.test.js
│   ├── issues.sequelize.test.js
│   ├── issues.test.js
│   ├── setup.js
│   ├── teardown.js
│   └── utils.js
├── Trail Day REST API.postman_collection.json
└── Trail Day REST API.postman_test_run.json
```

## Environment Configuration

The project uses environment-specific `.env` files:

- `.env.dev` — for local development
- `.env.test` — for integration and automated testing
- `.env.prod` — for production deployment

Each file contains database credentials, ports, and service-specific configuration.




## Getting Started

### 1. Enter project root and checkout the solution branch:

```bash
git checkout solution/masud-zaman
```

### 3. Environment Installation
Run the setup script:

```bash
chmod +x ./cmd/* && ./cmd/install
```


This `install` script will create a `.env` file with default values and set up the necessary Docker containers.
The installation script will fully automate the setup process, including the configuration of all Docker services, installation of necessary dependencies and specific configurations, database initialization, and seeding of initial data. With this single-step operation, everything will be up and running in just a few minutes. In most cases, you won’t need to manually verify or test any of the setup steps unless there are special circumstances that require attention.

And this is the simple installation process — setting everything up effortlessly, so you can get started in no time!


## Docker Shortcut Scripts

| Script     | Description                          | Example Usage                       |
|------------|--------------------------------------|-------------------------------------|
| `up`       | Starts Docker containers             | `./cmd/up`                              |
| `stop`     | Stops Docker containers              | `./cmd/stop`                            |
| `down`     | Stops and removes containers         | `./cmd/down`                            |
| `restart`  | Restarts containers                  | `./cmd/restart`                         |
| `rebuild`  | Rebuilds containers with no cache    | `./cmd/rebuild`                         |
| `reinstall`| Reinstall containers with fresh database | `./cmd/reinstall`                         |

Make them executable:

```bash
chmod +x cmd/*
```

## Managing the Project

Installation & Setup

Run the install script to build Docker images, start containers, wait for DB readiness, run migrations, and seed initial data:

`./cmd/install dev` or, simply `./cmd/install`

For test or prod:

./cmd/install test
./cmd/install prod


⸻

Reinstallation (Full Reset)

Completely clean volumes, rebuild, migrate, and seed:

./cmd/reinstall dev


⸻

Container Lifecycle
	•	Start containers (if stopped):

./cmd/start dev


	•	Stop containers:

./cmd/stop dev


	•	Restart containers:

./cmd/restart dev


	•	Rebuild containers (clean build):

./cmd/rebuild dev


	•	Execute shell inside app container:

./cmd/exec dev



⸻

Database Management
	•	MySQL container uses the SQL scripts in docker-entrypoint-initdb.d to initialize the database schema on first container startup.
	•	Sequelize migrations keep schema up to date.
	•	Seeders provide initial and sample data for testing.
	•	Migration and seed commands are triggered automatically during install and reinstall.
	•	Manual migration commands available:

docker exec -it $(docker-compose -f docker-compose.yml ps -q app) npm run migrate
docker exec -it $(docker-compose -f docker-compose.yml ps -q app) npm run seed
Or, 
./cmd/app
npm run migrate
npm run seed

⸻

## API Documentation: API Test Form
Swagger UI is available at:
URL: [http://localhost:5555](http://localhost:5555)

It provides interactive documentation and allows you to test all endpoints.

**Web URLs:**

- API Base URL: [http://localhost:8080](http://localhost:8080)
- PhpMyAdmin: [http://localhost:8081](http://localhost:8081)
- Database: `issue_db`
- Username: `root`
- Password: `abc123456`

⸻

Testing

Import the provided Postman collection Issue API Enhanced Collection to test:
	•	CRUD operations on issues
	•	Retrieval of issue revisions
	•	Edge cases and validation scenarios

⸻

Development Tips
	•	Use the cmd/env script to switch environment variables quickly.
	•	Edit .env.* files carefully to match your environment.
	•	Use Docker Compose override files if extending the stack.
	•	Run migration rollback commands if needed:

npm run db:migrate:undo
npm run db:migrate:undo:all



⸻

Troubleshooting
	•	Run shell inside app container to debug:

./cmd/exec dev

## Generating JWT Tokens

To generate a valid JWT token for authentication, use the provided script:

```bash
./cmd/token
```

This script loads the environment variables for the selected environment (default is dev) and outputs a signed JWT token.

Sample Output

Loading environment variables for dev
Generated JWT:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1hc3VkLnptbkBnbWFpbC5jb20iLCJyb2xlIjoiYXBwbGljYW50IiwiaWF0IjoxNzQ3OTI4OTQ3LCJleHAiOjE3NDc5MzYxNDd9.hiCx_vH8lcP1WF4mI2OFwRciREkvBOo7Cnm7Gokpbvw

Usage Notes
	•	Use this token in the Authorization header as Bearer <token> for all authenticated API requests.
	•	The token includes user email and role claims, signed with the secret specified in your environment (JWT_SECRET).
	•	Token expiry is configurable via the JWT_EXPIRES_IN environment variable.
	•	Remember to update or regenerate tokens as needed based on your authentication policies.


## User Authentication & Authorization

### Overview

- Introduced user management with `users` table storing email and hashed password.
- Added login API (`POST /login`) accepting email and password, returning JWT token and expiry.
- Configurable JWT secret and expiry time via environment variables (`JWT_SECRET`, `JWT_EXPIRES_IN`).
- Middleware enforces valid JWT for all protected routes except `/`, `/health`, and `/login`.
- Every request must include a valid `X-Client-ID` header matched against `VALID_CLIENT_ID` env variable (my-client-id-123).
- The email from the validated JWT is recorded as the author (`created_by` / `updated_by`) on issue changes.

### Usage

- Register users by seeding or direct DB insert with bcrypt hashed passwords.
- Obtain JWT token by calling `/login` with JSON body:

  ```json
  {
    "email": "admin@example.com",
    "password": "Password123"
  }```

  	•	Use the token in Authorization: Bearer <token> header for all protected API calls.
	•	Always include the valid X-Client-ID header on requests.
	•	Token expires based on JWT_EXPIRES_IN environment setting.


## Postman Collection

To use the Postman collection, follow these steps:

1. Import the **`./Trail Day REST API.postman_collection.json`** file into Postman.
2. After logging in or registering, save the **Bearer Token** in the `Authorization` section. You can use this token for subsequent requests.

