const express = require('express');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-memory "database" — just to give the app a bit of real behavior
let visitorLog = [];

// --- Health check ---
// AWS ALB / ECS will hit this constantly to decide if this container is alive.
// Keep it fast and dependency-free.
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptimeSeconds: process.uptime(),
    hostname: os.hostname(), // useful later to prove ALB is load balancing across tasks
  });
});

// --- Root route ---
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Node.js app running on AWS ECS Fargate',
    timestamp: new Date().toISOString(),
  });
});

// --- Info route ---
// Shows environment/container details — handy for demonstrating in an interview
// that the app is actually running inside a container on AWS, not locally.
app.get('/info', (req, res) => {
  res.status(200).json({
    hostname: os.hostname(),
    platform: os.platform(),
    nodeVersion: process.version,
    env: process.env.NODE_ENV || 'development',
    memoryUsageMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
  });
});

// --- Simple stateful route ---
// POST /visit logs a visitor name, GET /visitors lists them.
// Demonstrates basic request handling beyond static responses.
app.post('/visit', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'name is required in request body' });
  }
  const entry = { name, time: new Date().toISOString() };
  visitorLog.push(entry);
  res.status(201).json({ message: 'Visit logged', entry });
});

app.get('/visitors', (req, res) => {
  res.status(200).json({ count: visitorLog.length, visitors: visitorLog });
});

// --- 404 handler ---
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});