# jakeglevine.com

Minimalist personal website for Jake Levine — built as a single-page app, deployed to AWS via S3 + CloudFront.

## Stack

- **Frontend:** React 18 + Vite (no router, no UI library)
- **Styling:** Plain CSS with custom properties
- **Infrastructure:** Terraform — S3 (private) + CloudFront (OAC) + optional ACM TLS
- **Deploy:** AWS CLI via Makefile or GitHub Actions

## Repo structure

```
.
├── src/
│   ├── main.jsx        # React entry point
│   ├── App.jsx         # Single component — all page sections + data
│   ├── App.css         # Component styles
│   └── index.css       # CSS reset and custom properties
├── terraform/
│   ├── providers.tf    # AWS provider (primary region + us-east-1 alias for ACM)
│   ├── variables.tf    # aws_region, project_name, domain_name
│   ├── main.tf         # S3 bucket, CloudFront distribution, OAC, ACM (optional)
│   └── outputs.tf      # cloudfront_url, distribution_id, s3_bucket_name
├── .github/
│   └── workflows/
│       ├── infra.yml   # Terraform plan/apply — triggers on terraform/** changes
│       └── deploy.yml  # Build + S3 sync + CloudFront invalidation — triggers on src/** changes
├── index.html          # Vite HTML entry
├── vite.config.js
├── package.json
├── Makefile            # Dev, infra, and deploy targets (local)
└── BIO.md              # Source-of-truth profile data (scraped from LinkedIn)
```

## Local development

```bash
npm install
npm run dev       # http://localhost:5173
```

## Infrastructure

AWS resources are managed with Terraform. All credentials are read from environment variables — nothing is hardcoded.

### Prerequisites

- [Terraform](https://developer.hashicorp.com/terraform/install) >= 1.6
- [AWS CLI](https://aws.amazon.com/cli/) configured or credentials exported

### Remote state

Terraform state is stored in S3:

| Setting | Value |
|---|---|
| Bucket | `jgl2832-terraform-state` |
| Key | `jake-levine-site/terraform.tfstate` |
| Region | `eu-central-1` |

The state bucket must exist before running `terraform init`. Create it once manually if it doesn't already exist:

```bash
aws s3 mb s3://jgl2832-terraform-state --region eu-central-1
```

### Provision

```bash
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_DEFAULT_REGION=eu-central-1

make plan     # preview changes
make apply    # create/update resources
```

This provisions:

| Resource | Purpose |
|---|---|
| S3 bucket | Stores compiled site assets (private, no public access) |
| CloudFront OAC | Grants CloudFront-only access to the S3 bucket |
| CloudFront distribution | CDN + HTTPS, SPA fallback (403/404 → `index.html`) |
| ACM certificate | TLS cert for a custom domain *(only if `domain_name` is set)* |

### Custom domain (optional)

```bash
make plan TF_VARS='-var="domain_name=jakelevine.dev"'
make apply TF_VARS='-var="domain_name=jakelevine.dev"'
```

After apply, `terraform output acm_validation_records` will print the DNS records you need to add at your registrar to validate the certificate. Once validated, point your domain's CNAME at the CloudFront URL shown in `terraform output cloudfront_url`.

## Deploying the site

After infrastructure exists (`make apply` has been run at least once):

```bash
make deploy
```

This runs `npm run build`, syncs `dist/` to S3 with correct cache headers, then issues a CloudFront invalidation:

- All hashed Vite assets → `Cache-Control: public, max-age=31536000, immutable`
- `index.html` → `Cache-Control: no-cache, no-store, must-revalidate`

To invalidate the CloudFront cache without re-uploading:

```bash
make invalidate
```

## GitHub Actions

Two workflows automate the full lifecycle from a push to `main`.

### Required secrets

Both workflows use the `prod` GitHub environment. Set these secrets in **Settings → Environments → prod**:

| Secret | Description |
|---|---|
| `AWS_ACCESS_KEY_ID` | IAM access key |
| `AWS_SECRET_ACCESS_KEY` | IAM secret key |
| `AWS_REGION` | e.g. `eu-central-1` |
| `S3_BUCKET_NAME` | Bucket name from `terraform output s3_bucket_name` |
| `CF_DISTRIBUTION_ID` | From `terraform output cloudfront_distribution_id` |
| `DOMAIN_NAME` | *(optional)* Custom domain, e.g. `jakelevine.dev` |

> `S3_BUCKET_NAME` and `CF_DISTRIBUTION_ID` are available as outputs after the first infrastructure apply. The infra workflow prints them to the job summary automatically.

### `infra.yml` — Infrastructure

Triggered manually via `workflow_dispatch`. Choose `plan` or `apply` when running.

Steps: init → validate → plan → apply (when `apply` is chosen).

### `deploy.yml` — Site deploy

Triggered manually via `workflow_dispatch`.

Steps: install → build → S3 sync (hashed assets immutable, `index.html` no-cache) → CloudFront invalidation.

### Recommended first-time setup

```
1. Push repo to GitHub
2. Add AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION secrets
3. Run the Infrastructure workflow manually (action: apply)
4. Copy s3_bucket_name and cloudfront_distribution_id from the job summary
5. Add S3_BUCKET_NAME and CF_DISTRIBUTION_ID secrets
6. Push a change to src/ — Deploy workflow runs automatically
```

---

## Updating content

All page content lives in `src/App.jsx`:

- **Bio / headline** — edit the `<p className="bio">` and `<p className="headline">` in the `about` section
- **Experience** — edit the `EXPERIENCE` array at the top of the file
- **Education** — edit the hardcoded `education` section JSX
- **Links** — update the `href` values in the `links` div

`BIO.md` is the reference document for profile data and is not read at build time.
