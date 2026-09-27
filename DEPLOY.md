# Deploy runbook: Oracle VM (app) + Supabase (postgres)

## 0. Console prerequisites (done once, by hand)

- Supabase project `job-scanner-prod` (EU region), connection URI at hand.
- Oracle subnet security list: ingress `0.0.0.0/0`, TCP `8000`.
- SSH works: `ssh oracle-jobscanner` (config in `~/.ssh/config`).

## 1. VM prep (user `opc`)

Swap first — the micro has ~1 GB RAM:

```sh
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

Docker (Oracle Linux 9):

```sh
sudo dnf -y install dnf-plugins-core
sudo dnf config-manager --add-repo https://download.docker.com/linux/rhel/docker-ce.repo
sudo dnf -y install docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo systemctl enable --now docker
sudo usermod -aG docker opc
# log out and back in for the group to apply
```

Local firewall:

```sh
sudo firewall-cmd --permanent --add-port=8000/tcp
sudo firewall-cmd --reload
```

## 2. App deploy

```sh
git clone git@github.com:RayanRal/job_scanner.git /srv/job-scanner
cd /srv/job-scanner
cat > .env <<EOF
DATABASE_URL=postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres?sslmode=require
ADMIN_TOKEN=$(openssl rand -hex 32)
EOF
docker compose -f docker-compose.prod.yml up -d --build
```

Verify:

```sh
curl -s localhost:8000/api/jobs
docker compose -f docker-compose.prod.yml logs --tail 20 app
```

Add a company and force a scan (replace `$ADMIN_TOKEN` with the generated value):

```sh
curl -X POST localhost:8000/api/admin/companies \
  -H "X-Admin-Token: $ADMIN_TOKEN" -H 'Content-Type: application/json' \
  -d '{"name":"Acme","url":"https://boards.greenhouse.io/acme"}'
curl -X POST localhost:8000/api/admin/scan -H "X-Admin-Token: $ADMIN_TOKEN"
```

Public check from laptop: `http://<vm-ip>:8000/`.

## 3. Updates

```sh
cd /srv/job-scanner && git pull && docker compose -f docker-compose.prod.yml up -d --build
```
