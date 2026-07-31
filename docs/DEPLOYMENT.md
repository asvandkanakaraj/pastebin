# Deployment, CI/CD Pipeline & Monitoring

This document details the configuration for deploying the PasteBin application, setting up automated CI checks, and verifying system health via health metrics endpoints.

## 1. Advanced Health Monitoring Endpoint
To support container liveness probes (e.g., Kubernetes livenessProbe / readinessProbe) and cloud load balancer check signals (e.g., AWS Route53 or target groups), the server exposes an advanced pinging endpoint:

- **Method**: `GET`
- **URL**: `/health`

### Health Check Responses

#### 1. Success State (200 OK)
Returned when both the API server is responsive and the PostgreSQL database ping succeeds.
```json
{
  "status": "up",
  "uptime": "542.12s",
  "services": {
    "database": "connected",
    "api": "healthy"
  },
  "timestamp": "2026-07-31T09:40:00.000Z"
}
```

#### 2. Connection Failure (503 Service Unavailable)
Returned if the API is active but cannot connect to the database or run SQL queries.
```json
{
  "status": "down",
  "uptime": "542.12s",
  "services": {
    "database": "disconnected",
    "api": "healthy"
  },
  "timestamp": "2026-07-31T09:40:00.000Z",
  "error": "Can't reach database server at localhost:5432"
}
```

---

## 2. Production Log Collection
The application writes structured logs in JSON format for production environments:

- **Combined Logs**: Mapped to `apps/server/logs/combined.log` capturing all `info` and above events.
- **Exception Logs**: Mapped to `apps/server/logs/error.log` capturing error level events and full stack traces.
- **Format**: All logs outputted to file are serialized as JSON objects containing `timestamp`, `level`, and `message` properties.
