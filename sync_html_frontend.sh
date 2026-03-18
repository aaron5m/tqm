#!/bin/sh

while [ ! -f /app/dist/.build_complete ]; do
  echo "Waiting for frontend build to complete..."
  sleep 1
done

rm -rf /app/web_pages/assets /app/web_pages/index.html
mkdir -p /app/web_pages /app/web_pages/assets

for f in /app/dist/*; do
  base=$(basename "$f")
  if [ "$base" != "images" ]; then
    cp -R "$f" /app/web_pages/
  fi
done

cp -Rpn /app/frontend_public_images/* /app/html_images/