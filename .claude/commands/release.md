Deploy the current codebase to the production server at 178.104.136.133 (bunny-market.ch).

Steps:
1. Build the project locally first to catch errors: `npm run build`
2. Package the project: `tar --exclude=node_modules --exclude=.next --exclude=.git --exclude=dev.db -czf /tmp/bunny-market.tar.gz .`
3. Upload to server: `scp /tmp/bunny-market.tar.gz root@178.104.136.133:/root/`
4. On the server, extract to /opt/bunny-market, rebuild the Docker image, then restart the container:
   - Read JWT_SECRET from the running container: `docker inspect bunny-market --format '{{range .Config.Env}}{{println .}}{{end}}' | grep JWT_SECRET | cut -d= -f2`
   - If that fails, read it from `/opt/bunny-market/.env.production`
   - Preserve the bunny-data volume so the database persists
   - Bind to 127.0.0.1:3000 only (Caddy handles public traffic): `-p 127.0.0.1:3000:3000`
   - Use `--restart unless-stopped`
5. Verify the server responds with HTTP 200 at https://bunny-market.ch
6. Clean up the local tar file

Server setup notes:
- Caddy runs as a systemd service and reverse-proxies bunny-market.ch to localhost:3000
- Caddy handles HTTPS certificates automatically via Let's Encrypt
- Caddyfile is at /etc/caddy/Caddyfile
- Do NOT expose port 80 or 443 from Docker — Caddy owns those ports

Report the result to the user.
