# Strangerchat on Oracle Cloud Always Free (OCI)

This folder provisions **100% Always Free** Oracle Cloud Infrastructure using OpenTofu / Terraform (compatible with **OCI Resource Manager**, Oracle's free built-in equivalent to AWS CloudFormation):

* **Network:** VCN (`10.0.0.0/16`), Internet Gateway, Route Table, Public Subnet, Security List (ports `22`, `80`, `443` TCP/UDP)
* **Compute:** `VM.Standard.A1.Flex` (Ampere ARM64) — default **4 OCPUs, 24 GB RAM, 100 GB Boot Volume** (within OCI's Always Free limit of 4 OCPUs / 24 GB RAM / 200 GB storage)
* **Bootstrap (`cloud-init.yaml`):** Installs Docker + Docker Compose v2 and opens ports `80`/`443` in Oracle Ubuntu's default `iptables` firewall
* **App Stack (`docker-compose.yml` at repo root):** Caddy (auto-HTTPS), Next.js `web`, standalone WebSocket `chat-server` (no 300s timeout), PostgreSQL 17, and Redis 7

---

## Step 1: Create Your Free Oracle Cloud Account

1. Sign up at <https://www.oracle.com/cloud/free/>.
   * A credit/debit card is required for identity verification (you may see a temporary ~$1 hold that is refunded), **and Always Free resources cost $0/month**.
   * **Important — Choose your Home Region carefully:** You cannot change your Home Region later, and Always Free Ampere A1 capacity is only free in your Home Region. Larger regions (`us-ashburn-1`, `us-phoenix-1`, `eu-frankfurt-1`, `ap-singapore-1`) often have busy A1 pools; if you hit capacity limits, try another Availability Domain (`0`, `1`, `2`).
2. Make sure you have an SSH key pair on your computer:
   ```sh
   ssh-keygen -t ed25519 -C "strangerchat-oci"
   cat ~/.ssh/id_ed25519.pub
   ```

---

## Step 2: Provision the Free Server

### Option A: OCI Resource Manager (Web Console — No Local Terraform Needed)

1. Package the stack zip from this repo:
   ```sh
   bash infra/oci/build-orm-zip.sh
   ```
   This creates `infra/oci/strangerchat-oci-stack.zip`.
2. In the Oracle Cloud Console, open **Developer Services → Resource Manager → Stacks → Create stack**.
3. Choose **My configuration → .Zip file** and upload `strangerchat-oci-stack.zip`.
4. Fill in the guided form (powered by `schema.yaml`):
   * **Compartment:** your root compartment (or a dedicated one)
   * **SSH Public Key:** paste the output of `cat ~/.ssh/id_ed25519.pub`
   * **OCPU / RAM / Disk:** keep `4` OCPUs, `24` GB RAM, `100` GB disk (all Always Free)
5. Click **Next → Create**, then run **Plan** and **Apply**.
6. Note the **`public_ip`** in the **Outputs** tab once Apply succeeds.

> **If OCI says `Out of host capacity` for `VM.Standard.A1.Flex`:**
> Edit the stack variables and change **Availability Domain Index** from `0` to `1` or `2` and re-apply. If all ADs in a region are busy, temporarily try `2` OCPUs / `12` GB RAM or upgrade your OCI account to Pay-As-You-Go (Always Free resources still remain $0/month as long as you stay within 4 OCPUs / 24 GB / 200 GB).

### Option B: OpenTofu / Terraform CLI

```sh
cd infra/oci
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your compartment_ocid, region, and ssh_public_key
tofu init   # or: terraform init
tofu apply  # or: terraform apply
```

---

## Step 3: Point Your Domain & Configure Google OAuth + AdSense

1. **DNS:** At your domain registrar or **Cloudflare Free DNS** (disable the orange proxy cloud initially, or keep DNS-only while Caddy fetches your Let's Encrypt certificate), create an `A` record:
   * `chat.yourdomain.com` (or `@`) → `<public_ip_from_step_2>`
2. **Google OAuth:** In [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials), add:
   * Authorized JavaScript origin: `https://chat.yourdomain.com`
   * Authorized redirect URI: `https://chat.yourdomain.com/api/auth/callback/google`
3. **Google AdSense:** Add your custom domain in your Google AdSense account and note your `ca-pub-...` ID and banner/sidebar slot IDs.

---

## Step 4: Deploy Strangerchat on the Oracle Server

Wait ~2 minutes after VM creation for `cloud-init` to finish installing Docker, then SSH in:

```sh
ssh ubuntu@<public_ip>
docker --version && docker compose version
```

Clone your repository into `/opt/strangerchat` and start the full stack:

```sh
cd /opt/strangerchat
git clone <YOUR_REPO_URL> .
cp .env.docker.example .env
```

Edit `.env` (`nano .env`) with:
* `SITE_DOMAIN=chat.yourdomain.com`
* `ACME_EMAIL=you@gmail.com`
* `NEXT_PUBLIC_SITE_URL=https://chat.yourdomain.com`
* `NEXTAUTH_URL=https://chat.yourdomain.com`
* `NEXTAUTH_SECRET=$(openssl rand -base64 32)`
* `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
* Strong `POSTGRES_PASSWORD`
* `NEXT_PUBLIC_ADSENSE_CLIENT`, `NEXT_PUBLIC_ADSENSE_SLOT_BANNER`, `NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR`

Build and launch everything (note: the first ARM64 Next.js build takes a few minutes):

```sh
docker compose up -d --build
docker compose ps
docker compose logs -f caddy web chat-server
```

Once healthy, visit `https://chat.yourdomain.com` — Caddy will automatically provision a free Let's Encrypt TLS certificate, serve Next.js on `/`, and proxy `/api/ws` WebSockets directly to `chat-server`.
