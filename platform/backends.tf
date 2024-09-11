
#Configure Terraform state to use your S3 bucket
#Unfortunately the values need to be hardcoded or passed on the commandline
terraform {
  backend "s3" {
    bucket = "tfstate-sdt-bucket"
    key = "global/s3/terraform.tfstate"
    region = "us-east-1"
  
    dynamodb_table = "terraform-locks"
    encrypt = true
  }
}









