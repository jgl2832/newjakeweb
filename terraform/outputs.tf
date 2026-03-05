output "cloudfront_url" {
  description = "Public URL of the CloudFront distribution"
  value       = "https://${aws_cloudfront_distribution.site.domain_name}"
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID (needed for cache invalidations)"
  value       = aws_cloudfront_distribution.site.id
}

output "s3_bucket_name" {
  description = "Name of the S3 bucket holding the site assets"
  value       = aws_s3_bucket.site.bucket
}

output "acm_validation_records" {
  description = "DNS records required to validate the ACM certificate (only when domain_name is set)"
  value = var.domain_name != "" ? {
    for dvo in aws_acm_certificate.site[0].domain_validation_options : dvo.domain_name => {
      name  = dvo.resource_record_name
      type  = dvo.resource_record_type
      value = dvo.resource_record_value
    }
  } : {}
}
