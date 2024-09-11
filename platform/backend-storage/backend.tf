## This script creates the Terrraform backend that will be used by all other resources
## The .terraform.lock.hcl and terraform.tfstate will be saved to the repo
## in case this state file S3 bucket needs updating
## 

terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
    }
  }
}
#configure the provider
provider "aws" {
    region = var.region
  default_tags {
    tags = {
      Service   = "DiagnosticTool"
      DeploymentType = "Terraform"
    }
  }
}
#Create an S3 bucket for terraform state
resource "aws_s3_bucket" "terraform_state" {
  bucket = var.bucket_name
  #bucket = "${var.bucket_name}" 
  
  lifecycle {
    prevent_destroy = true  
  }
}

#Enable versioning so you can see the history of your statefile
resource "aws_s3_bucket_versioning" "enabled" {
    bucket = aws_s3_bucket.terraform_state.id
    versioning_configuration {
      status = "Enabled"
    }
}
#Enable server-side encryption by default
resource "aws_s3_bucket_server_side_encryption_configuration" "default" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"

    }
  }
}

#Explicitly deny all public access
resource "aws_s3_bucket_public_access_block" "public_access" {
    bucket = aws_s3_bucket.terraform_state.id
    block_public_acls = true
    block_public_policy = true
    ignore_public_acls = true
    restrict_public_buckets = true
}

#Create DynamoDB table to use for locking
resource "aws_dynamodb_table" "terraform_locks" {
    name = var.dynamo_name
    billing_mode = "PAY_PER_REQUEST"
    hash_key = var.dynamo_key
    attribute {
      name = var.dynamo_key
      type = "S"
    }
}