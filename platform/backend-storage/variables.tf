variable "region" {
  description = "The name of the AWS Region."
  default     = "us-east-1"
}

variable "encrypt_type" {
    description = "Provide type of encryption here"
    type        = string
    default     = "KMS"
}

# Input variable: S3 bucket name
variable "bucket_name" {
  description = "The name of the S3 bucket. Must be globally unique."
  default     = "tfstate-sdt-bucket"
}

variable "dynamo_name" {
  description = "The name of the dynamoDB table."
  default = "terraform-locks"
}

variable "dynamo_key" {
  description = "The name of the dynamoDB primary Key." 
  default = "LockID"
}
