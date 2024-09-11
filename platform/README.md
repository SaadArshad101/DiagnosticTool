# Platform Code

The goal is to use Terraform for all AWS deployments and configurations. This includes:
* S3 bucket for tfstate (in backend-storage/)
* S3 bucket for General Storage (s3.tf)
* ECR (Elastic Container Registry) (ecr.tf)
* EC2 - Test and Production (ec2.tf and ec2_startup.sh)

### Backend Configuration

Configure Terraform state to use S3 bucket
Unfortunately the values need to be hardcoded or passed on the commandline
```
terraform {
  backend "s3" {
    bucket = "tfstate-sdt-bucket"
    key = "global/s3/terraform.tfstate"
    region = "us-east-1"
  
    dynamodb_table = "terraform-locks"
    encrypt = true
  }
}
```
### Provider and default Tags Configuration
```
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
```
