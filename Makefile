# ── Config ────────────────────────────────────────────────────────────────────
TF_DIR     := terraform
DIST_DIR   := dist

# Read from environment — set these before running:
#   export AWS_ACCESS_KEY_ID=...
#   export AWS_SECRET_ACCESS_KEY=...
#   export AWS_DEFAULT_REGION=eu-central-1   (or match var.aws_region)
#
# Optional overrides passed through to Terraform:
TF_VARS    ?=
# e.g.  make plan TF_VARS='-var="domain_name=jakelevine.dev"'

# ── Helpers ───────────────────────────────────────────────────────────────────
.PHONY: all init plan apply destroy build deploy invalidate

# Fetch CloudFront distribution ID and S3 bucket from Terraform outputs
CF_DIST_ID  = $(shell cd $(TF_DIR) && terraform output -raw cloudfront_distribution_id 2>/dev/null)
S3_BUCKET   = $(shell cd $(TF_DIR) && terraform output -raw s3_bucket_name 2>/dev/null)

# ── Terraform ─────────────────────────────────────────────────────────────────

## Download providers / initialise backend
init:
	cd $(TF_DIR) && terraform init

## Preview infrastructure changes
plan: init
	cd $(TF_DIR) && terraform plan $(TF_VARS)

## Create / update infrastructure
apply: init
	cd $(TF_DIR) && terraform apply $(TF_VARS)

## Tear down all managed infrastructure
destroy:
	cd $(TF_DIR) && terraform destroy $(TF_VARS)

# ── Site build & deploy ───────────────────────────────────────────────────────

## Compile the Vite app into ./dist
build:
	npm run build

## Sync ./dist to S3 and invalidate CloudFront cache
deploy: build
	@test -n "$(S3_BUCKET)"   || (echo "ERROR: could not read s3_bucket_name from Terraform outputs. Run 'make apply' first." && exit 1)
	@test -n "$(CF_DIST_ID)"  || (echo "ERROR: could not read cloudfront_distribution_id from Terraform outputs." && exit 1)
	@echo "→ Syncing assets to s3://$(S3_BUCKET)"
	aws s3 sync $(DIST_DIR)/ s3://$(S3_BUCKET)/ \
		--delete \
		--cache-control "public,max-age=31536000,immutable" \
		--exclude "index.html"
	@echo "→ Uploading index.html (no-cache)"
	aws s3 cp $(DIST_DIR)/index.html s3://$(S3_BUCKET)/index.html \
		--cache-control "no-cache,no-store,must-revalidate"
	@echo "→ Invalidating CloudFront cache"
	aws cloudfront create-invalidation \
		--distribution-id $(CF_DIST_ID) \
		--paths "/*"
	@echo "✓ Deploy complete"

## Invalidate CloudFront cache without re-uploading
invalidate:
	@test -n "$(CF_DIST_ID)" || (echo "ERROR: could not read cloudfront_distribution_id." && exit 1)
	aws cloudfront create-invalidation \
		--distribution-id $(CF_DIST_ID) \
		--paths "/*"
