
#Create S3 bucket for General storage (e.g., MongoDB backups)
resource "aws_s3_bucket" "general_storage" {
  bucket = var.bucket_name
  
  lifecycle {
    prevent_destroy = true  
  }
}

#Enable versioning so you can see the history of your statefile
resource "aws_s3_bucket_versioning" "enabled" {
    bucket = aws_s3_bucket.general_storage.id
    versioning_configuration {
      status = "Enabled"
    }
}
#Enable server-side encryption by default
resource "aws_s3_bucket_server_side_encryption_configuration" "default" {
  bucket = aws_s3_bucket.general_storage.id

  rule {
    apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"

    }
  }
}

#Explicitly deny all public access
resource "aws_s3_bucket_public_access_block" "public_access" {
    bucket = aws_s3_bucket.general_storage.id
    block_public_acls = true
    block_public_policy = true
    ignore_public_acls = true
    restrict_public_buckets = true
}









