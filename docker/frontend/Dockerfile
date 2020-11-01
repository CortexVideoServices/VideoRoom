FROM videoroom/builder as builder
FROM cvs/base-nginx
COPY --from=builder /app/build /usr/share/nginx/html
COPY ./app_settings.nginx /etc/nginx/app_settings