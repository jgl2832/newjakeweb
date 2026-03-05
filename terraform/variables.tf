variable "aws_region" {
  description = "AWS region for primary resources"
  type        = string
  default     = "eu-central-1"
}

variable "project_name" {
  description = "Unique name used to namespace all resources"
  type        = string
  default     = "jakeglevine-web"
}

variable "domain_name" {
  description = "Custom domain name (e.g. jakelevine.dev). Leave empty to use the CloudFront default domain."
  type        = string
  default     = ""
}
