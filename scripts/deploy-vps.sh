#!/usr/bin/env bash
set -euo pipefail

# Registry credentials exist only for this deployment.
export DOCKER_CONFIG
DOCKER_CONFIG=$(mktemp -d)
trap 'rm -rf "$DOCKER_CONFIG"' EXIT
printf '%s' "$REGISTRY_TOKEN" | docker login ghcr.io --username "$REGISTRY_USER" --password-stdin
unset REGISTRY_TOKEN
docker pull "$IMAGE"

container=angular-gallery
previous=angular-gallery-previous
docker rm -f "$previous" 2>/dev/null || true
if docker container inspect "$container" >/dev/null 2>&1; then
  docker stop "$container"
  docker rename "$container" "$previous"
fi

rollback() {
  docker logs --tail 50 "$container" 2>/dev/null || true
  docker rm -f "$container" 2>/dev/null || true
  if docker container inspect "$previous" >/dev/null 2>&1; then
    docker rename "$previous" "$container"
    docker start "$container"
  fi
  exit 1
}

docker run -d --name "$container" --restart unless-stopped \
  --publish "127.0.0.1:${APP_PORT}:4000" \
  --env "SSR_ALLOWED_HOSTS=$SSR_ALLOWED_HOSTS" \
  "$IMAGE" || rollback

for attempt in {1..30}; do
  status=$(docker inspect --format '{{.State.Health.Status}}' "$container")
  if [[ "$status" == healthy ]]; then
    docker rm "$previous" 2>/dev/null || true
    echo 'Deployment healthy.'
    exit 0
  fi
  [[ "$status" != unhealthy ]] || rollback
  sleep 3
done
rollback
