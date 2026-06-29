#!/usr/bin/env bash
#
# deploy.sh — Déploiement initial de Tibeb sur le VPS Hetzner.
# À lancer UNE fois, en root :   sudo bash deploy.sh
#
# Ce script :
#   - installe les prérequis manquants (Node 20, pm2, certbot) sans casser l'existant
#   - crée un utilisateur DÉDIÉ "tibeb" SANS privilèges (l'app ne tourne jamais en root)
#   - clone le repo, prépare un .env persistant + un dossier photos persistant
#   - passe MongoDB en replica set (rétro-compatible — ton portfolio continue de tourner)
#   - build + démarre l'app sous pm2 (sous l'utilisateur tibeb), sur un port interne
#   - configure un bloc nginx dédié + HTTPS (certbot)
#
set -euo pipefail

############################  CONFIG — à adapter  ############################
APP_USER="tibeb"
DOMAIN="tibebtravel.com"
REPO_URL="https://github.com/davidmaimoun/tibeb.git"   # <-- METS TON REPO GITHUB
APP_PORT="3001"                                    # port interne (portfolio = 3000)
DB_NAME="tibeb"
LE_EMAIL="sudosudev.team@gmail.com"                # email pour Let's Encrypt
#############################################################################

BASE="/home/${APP_USER}"          # home de l'utilisateur (pm2, .pm2)
REPO_DIR="/var/www/tibeb"         # le code du site
SHARED="${BASE}/shared"           # .env + photos persistantes (hors /var/www)
ENV_FILE="${SHARED}/.env"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

log() { echo -e "\n\033[1;32m▶ $*\033[0m"; }
warn() { echo -e "\033[1;33m⚠ $*\033[0m"; }

[ "$(id -u)" = "0" ] || { echo "Lance ce script en root :  sudo bash deploy.sh"; exit 1; }

if [[ "$REPO_URL" == *"TON_USER"* ]]; then
  echo "✗ Édite d'abord REPO_URL en haut du script (ton repo GitHub)."; exit 1
fi

# ─────────────────────────────────────────────────────────────────────────
log "1/9 — Prérequis système"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y -qq
apt-get install -y -qq git curl rsync ca-certificates >/dev/null

# Node 20 si node absent ou trop vieux (< 18) — sans toucher à une install récente
NEED_NODE=1
if command -v node >/dev/null 2>&1; then
  MAJ="$(node -p 'process.versions.node.split(".")[0]')"
  [ "$MAJ" -ge 18 ] && NEED_NODE=0
fi
if [ "$NEED_NODE" = "1" ]; then
  log "Installation de Node.js 20"
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash - >/dev/null
  apt-get install -y -qq nodejs >/dev/null
else
  echo "Node $(node -v) déjà présent — OK"
fi

command -v pm2 >/dev/null 2>&1 || { log "Installation de pm2"; npm install -g pm2 >/dev/null; }
command -v certbot >/dev/null 2>&1 || { log "Installation de certbot"; apt-get install -y -qq certbot python3-certbot-nginx >/dev/null; }

# ─────────────────────────────────────────────────────────────────────────
log "2/9 — Utilisateur dédié (non-root) : ${APP_USER}"
if ! id "$APP_USER" >/dev/null 2>&1; then
  useradd -m -s /bin/bash "$APP_USER"
  echo "Utilisateur ${APP_USER} créé (aucun privilège sudo)."
else
  echo "Utilisateur ${APP_USER} déjà présent."
fi

# ─────────────────────────────────────────────────────────────────────────
log "3/9 — Dossiers"
mkdir -p "$REPO_DIR" "$SHARED/images"
# /var/www appartient à root : on donne le dossier du site à l'utilisateur tibeb,
# sinon le git clone / build (qui tournent sous tibeb) échouent en "Permission denied".
chown -R "${APP_USER}:${APP_USER}" "$BASE"
chown -R "${APP_USER}:${APP_USER}" "$REPO_DIR"

# ─────────────────────────────────────────────────────────────────────────
log "4/9 — Récupération du code"
if [ ! -d "${REPO_DIR}/.git" ]; then
  sudo -u "$APP_USER" git clone "$REPO_URL" "$REPO_DIR"
else
  echo "Repo déjà cloné."
fi

# ─────────────────────────────────────────────────────────────────────────
log "5/9 — Fichier .env persistant"
if [ ! -f "$ENV_FILE" ]; then
  SECRET="$(openssl rand -base64 32)"
  cat > "$ENV_FILE" <<EOF
# --- Base de données (replica set obligatoire pour Prisma) ---
DATABASE_URL="mongodb://127.0.0.1:27017/${DB_NAME}?replicaSet=rs0"

# --- Auth.js ---
AUTH_SECRET="${SECRET}"
AUTH_URL="https://${DOMAIN}"

# --- SEO ---
NEXT_PUBLIC_SITE_URL="https://${DOMAIN}"

# --- E-mail (Resend) ---
RESEND_API_KEY=""
RESEND_FROM="Tibeb <bookings@${DOMAIN}>"
NOTIFY_EMAIL="${LE_EMAIL}"

# --- Contacts publics ---
NEXT_PUBLIC_WHATSAPP="+251900000000"
NEXT_PUBLIC_CONTACT_EMAIL="hello@${DOMAIN}"
NEXT_PUBLIC_OWNER_WHATSAPP="+972500000000"

# --- Port interne (proxifié par nginx) ---
PORT="${APP_PORT}"
EOF
  chown "${APP_USER}:${APP_USER}" "$ENV_FILE"
  chmod 600 "$ENV_FILE"
  warn "Un .env a été généré (AUTH_SECRET aléatoire). Édite-le pour remplir RESEND_API_KEY, WhatsApp, etc. :"
  warn "   sudo -u ${APP_USER} nano ${ENV_FILE}"
else
  echo ".env déjà présent — conservé."
fi
# Lien symbolique pour que le build lise le .env (gitignored côté repo)
sudo -u "$APP_USER" ln -sfn "$ENV_FILE" "${REPO_DIR}/.env"

# ─────────────────────────────────────────────────────────────────────────
log "6/9 — MongoDB en replica set (rétro-compatible avec ton autre app)"
MONGO_CONF="/etc/mongod.conf"
if [ -f "$MONGO_CONF" ] && ! grep -q "replSetName" "$MONGO_CONF"; then
  cp "$MONGO_CONF" "${MONGO_CONF}.bak.$(date +%s)"
  printf "\nreplication:\n  replSetName: rs0\n" >> "$MONGO_CONF"
  systemctl restart mongod
  sleep 3
  echo "Replication activée dans mongod.conf (backup conservé)."
else
  echo "Replication déjà configurée (ou mongod.conf introuvable) — on n'y touche pas."
fi
# Initialise le replica set s'il ne l'est pas déjà
if command -v mongosh >/dev/null 2>&1; then
  mongosh --quiet --eval '
    try { rs.status() } catch (e) {
      rs.initiate({_id:"rs0", members:[{_id:0, host:"127.0.0.1:27017"}]});
      print("replica set initialisé");
    }' || warn "Init replica set : vérifie manuellement avec  mongosh --eval 'rs.status().myState'"
else
  warn "mongosh introuvable — initialise une fois :  mongosh --eval \"rs.initiate({_id:'rs0',members:[{_id:0,host:'127.0.0.1:27017'}]})\""
fi

# ─────────────────────────────────────────────────────────────────────────
log "7/9 — Build + démarrage de l'app (sous ${APP_USER})"
# deploy.sh est souvent dans /root (inaccessible à tibeb) : on copie le script
# de mise à jour dans le home de tibeb, qui pourra le lire/l'exécuter.
if [ -f "${SCRIPT_DIR}/update_tibeb.sh" ]; then
  cp "${SCRIPT_DIR}/update_tibeb.sh" "${BASE}/update_tibeb.sh"
  chown "${APP_USER}:${APP_USER}" "${BASE}/update_tibeb.sh"
  chmod +x "${BASE}/update_tibeb.sh"
else
  echo "✗ update_tibeb.sh introuvable à côté de deploy.sh."; exit 1
fi
sudo -u "$APP_USER" APP_PORT="$APP_PORT" bash "${BASE}/update_tibeb.sh"

# pm2 au démarrage de la machine, pour l'utilisateur tibeb
env PATH="$PATH" pm2 startup systemd -u "$APP_USER" --hp "$BASE" >/dev/null || true
sudo -u "$APP_USER" pm2 save >/dev/null || true

# ─────────────────────────────────────────────────────────────────────────
log "8/9 — nginx (bloc dédié, sans toucher aux autres sites)"
read -r -d '' NGINX_CONF <<EOF || true
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} www.${DOMAIN};

    client_max_body_size 20m;

    location / {
        proxy_pass http://127.0.0.1:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

if [ -d /etc/nginx/sites-available ]; then
  # Convention Debian/Ubuntu : sites-available + sites-enabled
  echo "$NGINX_CONF" > "/etc/nginx/sites-available/${DOMAIN}"
  ln -sfn "/etc/nginx/sites-available/${DOMAIN}" "/etc/nginx/sites-enabled/${DOMAIN}"
  echo "Config écrite dans sites-available/${DOMAIN}"
else
  # Convention conf.d
  echo "$NGINX_CONF" > "/etc/nginx/conf.d/${DOMAIN}.conf"
  echo "Config écrite dans conf.d/${DOMAIN}.conf"
fi
nginx -t && systemctl reload nginx
echo "Bloc nginx pour ${DOMAIN} activé."

# ─────────────────────────────────────────────────────────────────────────
log "9/9 — HTTPS (Let's Encrypt)"
if getent hosts "$DOMAIN" >/dev/null 2>&1; then
  certbot --nginx -d "$DOMAIN" -d "www.${DOMAIN}" \
    --non-interactive --agree-tos -m "$LE_EMAIL" --redirect \
    || warn "certbot a échoué — relance plus tard :  certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
else
  warn "Le DNS de ${DOMAIN} ne pointe pas encore ici. Fais pointer les A records vers ce serveur, puis :"
  warn "   certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --agree-tos -m ${LE_EMAIL} --redirect"
fi

# ─────────────────────────────────────────────────────────────────────────
log "Terminé ✅"
cat <<EOF

Prochaines étapes :
  1) Remplis le .env :            sudo -u ${APP_USER} nano ${ENV_FILE}
  2) Dépose tes photos dans :     ${SHARED}/images/   (mêmes noms que public/images :
                                   gallery/… places/… hero1.jpg hero2.jpg hero3.jpg guide.jpg)
  3) Crée ton compte admin (1 fois) :
       sudo -u ${APP_USER} bash -c 'cd ${REPO_DIR} && set -a && . ${ENV_FILE} && set +a \\
         && SEED_ADMIN_EMAIL="toi@mail.com" SEED_ADMIN_PASSWORD="motdepasse" npm run seed'
  4) Relance une mise à jour :    sudo -u ${APP_USER} APP_PORT=${APP_PORT} bash ${BASE}/update_tibeb.sh

Logs en direct :  sudo -u ${APP_USER} pm2 logs tibeb
EOF