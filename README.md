# ECS Fargate Node API

A production-style deployment pipeline for a Node.js/Express API — containerized with Docker and deployed on **AWS ECS Fargate**, running behind an **Application Load Balancer** for high availability and health-checked routing.

Built as a hands-on infrastructure project to demonstrate containerization, container orchestration, and load-balanced deployment on AWS — without managing any underlying servers.

## Architecture

```
GitHub (source code)
       │
       ▼  docker build
Docker image
       │
       ▼  docker push
Amazon ECR (image registry)
       │
       ▼  ECS pulls image
ECS Fargate Task (serverless container)
       │
       ▼  registered as a target
Application Load Balancer  ──►  Internet (HTTP)
```

## Tech Stack

- **Application**: Node.js, Express
- **Containerization**: Docker
- **Image registry**: Amazon ECR
- **Orchestration**: Amazon ECS (Fargate launch type — no EC2 instances to manage)
- **Traffic routing**: Application Load Balancer with a health-checked target group
- **Infrastructure**: AWS CLI, IAM

## API Endpoints

| Method | Path        | Description                                   |
|--------|-------------|------------------------------------------------|
| GET    | `/`         | Basic status response                          |
| GET    | `/health`   | Health check endpoint used by the ALB and ECS  |
| GET    | `/info`     | Runtime/container diagnostics                  |
| POST   | `/visit`    | Log a visitor (`{ "name": "..." }`)            |
| GET    | `/visitors` | List logged visitors                           |

## How It's Deployed

1. **Containerize** — the app is built into a Docker image locally and tested with `docker run`.
2. **Push to ECR** — the image is tagged and pushed to a private Amazon ECR repository, authenticated via short-lived tokens from the AWS CLI (no long-lived credentials stored anywhere).
3. **Define the task** — an ECS Task Definition specifies the container image, CPU/memory allocation, and exposed port (3000).
4. **Load balance** — an Application Load Balancer listens on port 80 and forwards traffic to a target group, which health-checks each container on `/health` before routing traffic to it.
5. **Run the service** — an ECS Service (Fargate) keeps the desired number of tasks running, registers them with the target group, and automatically replaces any task that fails its health check.

## Key Design Decisions

- **Fargate over EC2**: no servers to patch, size, or manage — AWS handles the underlying compute.
- **Least-privilege networking**: the container's security group only accepts traffic from the ALB's security group, not the open internet — the ALB is the only public entry point.
- **Health checks at two levels**: Docker's own `HEALTHCHECK` in the Dockerfile, plus an independent ALB target group health check against `/health`, which is what actually determines live traffic routing.
- **Stateless, horizontally scalable design**: the ECS service's desired task count can be increased (e.g., from 1 to 3) with no code or configuration changes — the ALB automatically load-balances across all running tasks.

## Local Development

```bash
npm install
npm start
# App runs on http://localhost:3000
```

## Local Docker Test

```bash
docker build -t demo .
docker run -p 3000:3000 demo
# App runs on http://localhost:3000
```

## Possible Next Steps

- Add an HTTPS listener (port 443) via AWS Certificate Manager (ACM)
- Add CI/CD with GitHub Actions to automatically build and push new images to ECR on merge
- Add ECS Service Auto Scaling based on CPU/memory utilization
- Attach a custom domain via Route 53