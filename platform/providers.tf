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









