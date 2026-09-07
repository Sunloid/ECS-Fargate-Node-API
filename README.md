# demo-node-aws

A sample Node.js/Express API, containerized with Docker and deployed to
**AWS ECS Fargate** behind an **Application Load Balancer** with **HTTPS** (ACM).

## Architecture

```
Internet → ALB (HTTPS via ACM) → ECS Fargate Service → Task (Docker container)
                                        ↓
                                  ECR (image storage)
```

## Routes

| Method | Path        | Description                              |
|--------|-------------|-------------------------------------------|
| GET    | `/`         | Basic status message                      |
| GET    | `/health`   | Health check used by ALB/ECS              |
| GET    | `/info`     | Container/runtime diagnostics             |
| POST   | `/visit`    | Log a visitor `{ "name": "..." }`         |
| GET    | `/visitors` | List logged visitors                      |

## Run locally (no Docker)

```bash
npm install
npm start
# visit http://localhost:3000
```

## Run locally (Docker)

```bash
docker build -t demo-node-aws .
docker run -p 3000:3000 demo-node-aws
# visit http://localhost:3000
```

## Deployment

See project notes — deployed via:
1. Docker image pushed to Amazon ECR
2. ECS Fargate cluster + service running the task
3. Application Load Balancer routing HTTPS traffic to the service
4. ACM certificate for TLS termination at the ALB
