#!/usr/bin/env bash
#
# update_tibeb.sh — Mise à jour de Tibeb (git pull → build → restart).
# À lancer SOUS l'utilisateur tibeb (PAS en root) :
#     sudo -u tibeb APP_PORT=3001 bash update_tibeb.sh
#
# Idempotent : peut être relancé autant de fois que nécessaire.
# Préserve les photos persistantes (shared/images) et le .env.
#
set -euo pipefail

APP_USER="tibeb"
BASE="/home/${APP_USER}"
REPO_DIR="/var/www/tibeb"
SHARED="${BASE}/shared"
ENV_FILE="${SHARED}/.env"
APP_PORT="${APP_PORT:-3001}"
STANDALONE="${REPO_DIR}/.next/standalone"

log() { echo -e "\n\033[1;36m▶ $*\033[0m"; }

# Sécurité : ne pas tourner en root
if [ "$(id -u)" = "0" ]; then
  echo "✗ Ne lance PAS ce script en root. Utilise :  sudo -u ${APP_USER} APP_PORT=${APP_PORT} bash update_tibeb.sh"
  exit 1
fi

cd "$REPO_DIR"

# Charge les variables d'environnement (pour db:push, le build NEXT_PUBLIC_*, et le runtime)
set -a
# shellcheck disable=SC1090
. "$ENV_FILE"
set +a

log "Git pull"
git pull --ff-only

log "Dépendances"
npm ci || npm install

log "Schéma Prisma (additif, non destructif)"
npm run db:push

log "Build Next.js (standalone)"
npm run build

log "Préparation du dossier standalone"
# Next ne copie pas automatiquement static/ et public/ dans le standalone : on le fait.
rm -rf "${STANDALONE}/.next/static"
cp -r .next/static "${STANDALONE}/.next/static"
rm -rf "${STANDALONE}/public"
cp -r public "${STANDALONE}/public"

# Overlay des photos persistantes — UNIQUEMENT si tu uploades des images
# directement sur le serveur (hors Git). Si tes photos sont dans le repo
# GitHub (cas le plus simple), laisse shared/images vide : ce bloc ne fera rien.
mkdir -p "${SHARED}/images"
if [ -n "$(ls -A "${SHARED}/images" 2>/dev/null)" ]; then
  echo "  (overlay des photos depuis ${SHARED}/images)"
  if command -v rsync >/dev/null 2>&1; then
    rsync -a "${SHARED}/images/" "${STANDALONE}/public/images/"
  else
    cp -r "${SHARED}/images/." "${STANDALONE}/public/images/" 2>/dev/null || true
  fi
fi

log "(Re)démarrage PM2"
export PORT="$APP_PORT" HOSTNAME="127.0.0.1" NODE_ENV="production"
if pm2 describe tibeb >/dev/null 2>&1; then
  pm2 reload tibeb --update-env
else
  ( cd "$STANDALONE" && pm2 start server.js --name tibeb --update-env )
fi
pm2 save >/dev/null || true

log "OK ✅  →  https://tibebtravel.com"
echo "Logs :  pm2 logs tibeb"