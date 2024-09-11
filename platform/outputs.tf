output "test_private_ip" {
    description = "Private IP of the Test EC2"
    value = resource.aws_instance.ec2_instance[0].private_ip
  }
output "prod_private_ip" {
    description = "Private IP of the Prod EC2"
    value = resource.aws_instance.prod_ec2_instance[0].private_ip
}

output "s3_bucket_name" {
    description = "Name of the S3 storage bucket"
    value = try(aws_s3_bucket.general_storage.id)
  }

output "repository_arn" {
  description = "The ARN of the repository."
  value = aws_ecr_repository.ecr["diagnostictool/app"].repository_url
}
  