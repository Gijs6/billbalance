# billbalance

```sh
docker run -d \
  -p 3000:3000 \
  -v billbalance-data:/data \
  -e ORIGIN=https://billbalance.example.com \
  -e SMTP_HOST=smtp.example.com \
  -e SMTP_PORT=587 \
  -e SMTP_USER=you@example.com \
  -e SMTP_PASS=changeme \
  -e SMTP_FROM=you@example.com \
  ghcr.io/gijs6/billbalance
```
