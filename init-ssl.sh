#!/bin/bash
set -e

# Load environment variables
if [ ! -f .env ]; then
    echo "Error: .env file not found. Please copy .env.example to .env and configure it."
    exit 1
fi

source .env

if [ -z "$DOMAIN_NAME" ] || [ -z "$CERTBOT_EMAIL" ]; then
    echo "Error: DOMAIN_NAME or CERTBOT_EMAIL is not defined in .env"
    exit 1
fi

echo "========================================================="
echo " Setting up Let's Encrypt SSL for: $DOMAIN_NAME"
echo "========================================================="

RSA_KEY_SIZE=4096
DATA_PATH="./certbot"
DOMAINS=("$DOMAIN_NAME" "www.$DOMAIN_NAME")

# Create volume directories if not existing
mkdir -p "$DATA_PATH/conf/live/$DOMAIN_NAME"
mkdir -p "$DATA_PATH/www"

# Check if real certificate already exists
if [ -d "$DATA_PATH/conf/live/$DOMAIN_NAME" ] && [ -f "$DATA_PATH/conf/live/$DOMAIN_NAME/fullchain.pem" ]; then
    echo "SSL Certificate already exists for $DOMAIN_NAME."
    read -p "Do you want to replace existing certificate? (y/N) " DECISION
    if [ "$DECISION" != "y" ] && [ "$DECISION" != "Y" ]; then
        exit 0
    fi
fi

echo "### Creating dummy certificate for $DOMAIN_NAME to let Nginx start..."
DUMMY_PATH="/etc/letsencrypt/live/$DOMAIN_NAME"
docker compose -f docker-compose.prod.yml run --rm --entrypoint "\
  sh -c 'mkdir -p $DUMMY_PATH && \
  openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout \"$DUMMY_PATH/privkey.pem\" \
    -out \"$DUMMY_PATH/fullchain.pem\" \
    -subj \"/CN=localhost\"'" certbot

echo "### Starting Nginx..."
docker compose -f docker-compose.prod.yml up --force-recreate -d nginx

echo "### Deleting dummy certificate..."
docker compose -f docker-compose.prod.yml run --rm --entrypoint "\
  rm -Rf /etc/letsencrypt/live/$DOMAIN_NAME && \
  rm -Rf /etc/letsencrypt/archive/$DOMAIN_NAME && \
  rm -Rf /etc/letsencrypt/renewal/$DOMAIN_NAME.conf" certbot

echo "### Requesting Let's Encrypt certificate for $DOMAIN_NAME..."
DOMAIN_ARGS=""
for DOM in "${DOMAINS[@]}"; do
  DOMAIN_ARGS="$DOMAIN_ARGS -d $DOM"
done

docker compose -f docker-compose.prod.yml run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    $DOMAIN_ARGS \
    --email $CERTBOT_EMAIL \
    --rsa-key-size $RSA_KEY_SIZE \
    --agree-tos \
    --force-renewal \
    --non-interactive" certbot

echo "### Reloading Nginx with new certificate..."
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload

echo "========================================================="
echo " SSL Certificate successfully installed!"
echo " Visit: https://$DOMAIN_NAME"
echo "========================================================="

