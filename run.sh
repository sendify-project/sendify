#!/bin/bash

# Get the host IP address (works on Linux/WSL)
get_ip() {
    # Try hostname -I first (most reliable on Linux)
    local ip=$(hostname -I 2>/dev/null | awk '{print $1}')

    # Fallback to ip command
    if [ -z "$ip" ]; then
        ip=$(ip -4 addr show scope global | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | head -n1)
    fi

    # Fallback to ifconfig
    if [ -z "$ip" ]; then
        ip=$(ifconfig 2>/dev/null | grep -E "inet [0-9]" | grep -v 127.0.0.1 | awk '{print $2}' | head -n1)
    fi

    echo "$ip"
}

export REDIS_CLUSTER_IP=$(get_ip)
export REDIS_PASSWORD=pass.123

# Show usage
usage() {
    echo "Usage: $0 {run|start|stop|down|down-all|status|logs|restart}"
    echo ""
    echo "Commands:"
    echo "  run, start    Start all services (background)"
    echo "  stop          Stop all services (keep containers)"
    echo "  down          Stop and remove containers (keep data)"
    echo "  down-all      Stop and remove everything including data"
    echo "  status        Show service status"
    echo "  logs          Show logs (use Ctrl+C to exit)"
    echo "  restart       Restart all services"
    exit 1
}

echo "REDIS_CLUSTER_IP: $REDIS_CLUSTER_IP"
echo "REDIS_PASSWORD: $REDIS_PASSWORD"

case "$1" in
    "run"|"start")
        echo "Starting Sendify..."
        docker-compose up -d
        echo ""
        echo "Sendify is starting up!"
        echo "  Web UI: http://localhost:80"
        echo "  MinIO:  http://localhost:9000"
        echo ""
        echo "Note: First startup may take ~30s while Cassandra initializes."
        echo "Use '$0 logs' to view logs"
        echo "Use '$0 status' to check service status"
        ;;
    "stop")
        echo "Stopping Sendify..."
        docker-compose stop
        ;;
    "down")
        echo "Stopping and removing containers..."
        docker-compose down
        ;;
    "down-all")
        echo "Stopping and removing everything (including volumes)..."
        docker-compose down -v
        ;;
    "status")
        docker-compose ps
        ;;
    "logs")
        docker-compose logs -f
        ;;
    "restart")
        echo "Restarting Sendify..."
        docker-compose restart
        ;;
    *)
        usage
        ;;
esac
