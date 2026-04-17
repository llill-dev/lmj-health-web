#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
COMPOSE_FILE=${COMPOSE_FILE:-"$SCRIPT_DIR/docker-compose.prod.yml"}
ENV_FILE=${ENV_FILE:-"$SCRIPT_DIR/.env.prod"}
SERVICE_NAME=${SERVICE_NAME:-lmj-frontend}
HEALTHCHECK_URL=${HEALTHCHECK_URL:-http://127.0.0.1:8080/healthz}
MAX_ATTEMPTS=${MAX_ATTEMPTS:-30}
SLEEP_SECONDS=${SLEEP_SECONDS:-2}

if [ ! -f "$COMPOSE_FILE" ]; then
  echo "Compose file not found: $COMPOSE_FILE" >&2
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required but was not found in PATH." >&2
  exit 1
fi

if [ -f "$ENV_FILE" ]; then
  echo "Using deploy env file: $ENV_FILE"
  set -- --env-file "$ENV_FILE" -f "$COMPOSE_FILE"
else
  echo "Deploy env file not found, using compose defaults: $ENV_FILE"
  set -- -f "$COMPOSE_FILE"
fi

echo "Validating compose configuration..."
docker compose "$@" config >/dev/null

echo "Building frontend image..."
docker compose "$@" build "$SERVICE_NAME"

echo "Starting frontend service..."
docker compose "$@" up -d "$SERVICE_NAME"

CONTAINER_ID=$(docker compose "$@" ps -q "$SERVICE_NAME")

if [ -z "$CONTAINER_ID" ]; then
  echo "Failed to resolve container id for service: $SERVICE_NAME" >&2
  exit 1
fi

echo "Waiting for healthcheck: $HEALTHCHECK_URL"
attempt=1
while [ "$attempt" -le "$MAX_ATTEMPTS" ]; do
  HEALTH_STATUS=$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}unknown{{end}}' "$CONTAINER_ID")
  if [ "$HEALTH_STATUS" = "healthy" ]; then
    echo "Frontend container is healthy."
    break
  fi

  if [ "$HEALTH_STATUS" = "unhealthy" ]; then
    echo "Frontend container reported unhealthy status." >&2
    docker logs --tail 100 "$CONTAINER_ID" >&2 || true
    exit 1
  fi

  if wget -q -O /dev/null "$HEALTHCHECK_URL"; then
    echo "Frontend health endpoint responded successfully."
    break
  fi

  echo "Attempt $attempt/$MAX_ATTEMPTS: health not ready yet (status=$HEALTH_STATUS)"
  attempt=$((attempt + 1))
  sleep "$SLEEP_SECONDS"
done

if [ "$attempt" -gt "$MAX_ATTEMPTS" ]; then
  echo "Timed out waiting for frontend healthcheck." >&2
  docker logs --tail 100 "$CONTAINER_ID" >&2 || true
  exit 1
fi

echo "Deployment status:"
docker compose "$@" ps

echo "Recent container logs:"
docker logs --tail 50 "$CONTAINER_ID" || true
