# Docker Setup for PaperFly

## Quick Start

### Build and Run with Docker Compose

```bash
# Build the Docker image
docker-compose build

# Start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

### Manual Docker Commands

```bash
# Build the image
docker build -t paperfly:latest .

# Run the container
docker run -d -p 3000:3000 --name paperfly-app paperfly:latest

# View logs
docker logs -f paperfly-app

# Stop and remove
docker stop paperfly-app
docker rm paperfly-app
```

## Access the Application

Once running, access the application at:
- **URL**: http://localhost:3000
- **Status**: Check with `docker-compose ps`

## Health Check

The container includes a health check that verifies the application is responding:
- Interval: 30 seconds
- Timeout: 10 seconds
- Retries: 3

## Docker Image Details

- **Base Image**: node:20-alpine
- **Multi-stage Build**: Yes (deps, builder, runner)
- **Static Export**: Uses Next.js static export
- **Web Server**: serve (static file server)
- **Port**: 3000

## Production Considerations

1. **Environment Variables**: Add any required env vars to `docker-compose.yml`
2. **Resource Limits**: Consider adding memory/CPU limits for production
3. **Reverse Proxy**: Use nginx or similar for production
4. **SSL/TLS**: Configure HTTPS in production
5. **Monitoring**: Add logging and monitoring solutions

## Troubleshooting

### Container won't start
```bash
docker-compose logs
```

### Rebuild from scratch
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Check container status
```bash
docker-compose ps
docker-compose exec paperfly sh  # Access container shell
```

