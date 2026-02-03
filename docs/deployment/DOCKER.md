# Docker Setup for SoloSuccess AI

This document provides instructions for running the SoloSuccess AI application using Docker.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)

## Quick Start

### 1. Build and Run with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Run in detached mode (background)
docker-compose up -d --build
```

### 2. Access the Application

- **Application**: http://localhost:3000
- **Database**: localhost:5432

## Individual Docker Commands

### Build the Application Image

```bash
# Build the Docker image
docker build -t solosuccess-ai .

# Build with specific tag
docker build -t solosuccess-ai:latest .
```

### Run the Application Container

```bash
# Run the container
docker run -p 3000:3000 --env-file .env.production solosuccess-ai

# Run with environment variables
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5432/solosuccess" \
  -e NODE_ENV=production \
  solosuccess-ai
```

## Database Setup

### Using Docker Compose (Recommended)

The `docker-compose.yml` file is configured to use your Neon cloud database. Make sure your `.env.production` file contains your Neon database URL and API keys.

### Manual Database Setup

If you need to set up the database manually:

```bash
# Run database migrations
docker-compose exec app npm run migrate

# Or run specific setup scripts
docker-compose exec app npm run setup-db
docker-compose exec app npm run setup-templates
```

## Environment Variables

Create a `.env.production` file with the following variables:

```env
# Database (Neon Cloud)
DATABASE_URL=postgresql://neondb_owner:your_password@ep-your-endpoint.neon.tech/neondb?sslmode=require

# Application
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# Add your other environment variables here
# API_KEYS, SECRETS, etc.
```

## Development with Docker

### Development Mode

For development, you might want to mount your source code:

```bash
# Run with volume mounting for development
docker run -p 3000:3000 \
  -v $(pwd):/app \
  -v /app/node_modules \
  -v /app/.next \
  --env-file .env.local \
  solosuccess-ai npm run dev
```

### Debugging

```bash
# View logs
docker-compose logs -f app

# Access container shell
docker-compose exec app sh

# Check container status
docker-compose ps
```

## Production Deployment

### Build for Production

```bash
# Build production image
docker build -t solosuccess-ai:production .

# Tag for registry
docker tag solosuccess-ai:production your-registry/solosuccess-ai:latest
```

### Deploy to Production

```bash
# Push to registry
docker push your-registry/solosuccess-ai:latest

# Deploy with docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using port 3000
   lsof -i :3000
   
   # Kill the process or change port in docker-compose.yml
   ```

2. **Database Connection Issues**
   ```bash
   # Check database container
   docker-compose logs postgres
   
   # Test database connection
   docker-compose exec postgres psql -U postgres -d solosuccess
   ```

3. **Build Failures**
   ```bash
   # Clean build
   docker-compose down
   docker system prune -f
   docker-compose up --build
   ```

### Health Checks

```bash
# Check application health
curl http://localhost:3000/api/health

# Check database health
docker-compose exec postgres pg_isready -U postgres
```

## Useful Commands

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# View resource usage
docker stats

# Clean up unused images
docker image prune

# Clean up everything
docker system prune -a
```

## Security Considerations

1. **Environment Variables**: Never commit `.env` files with secrets
2. **Database**: Use strong passwords in production
3. **Network**: Consider using Docker networks for service isolation
4. **Updates**: Regularly update base images for security patches

## Performance Optimization

1. **Multi-stage Build**: The Dockerfile uses multi-stage builds for smaller images
2. **Layer Caching**: Dependencies are cached in separate layers
3. **Production Build**: Uses Next.js standalone output for optimal performance

## Monitoring

```bash
# Monitor container logs
docker-compose logs -f

# Monitor resource usage
docker stats solosuccess-app solosuccess-postgres

# Check container health
docker-compose ps
```
