# Use a small, official Node.js image
FROM node:18-alpine

# App lives here inside the container
WORKDIR /app

# Copy dependency manifests first (better Docker layer caching:
# if only server.js changes, npm install won't re-run)
COPY package*.json ./

RUN npm install --production

# Now copy the rest of the app
COPY . .

# Container listens on this port (matches server.js default)
EXPOSE 3000

# Basic container-level health check (optional, ECS/ALB will also check /health)
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "server.js"]