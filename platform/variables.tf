variable "region" {
  description = "The name of the AWS Region."
  default     = "us-east-1"
}

## ECR Variables
variable "ecr_name" {
    description = "The list of ecr names to create"
    type        = list(string)
    default     = [ "diagnostictool/app", "diagnostictool/mongo"]
}
//We want this to be mutable so older images can be removed
variable "image_mutability" {
    description = "Provide image mutability"
    type        = string
    default     = "MUTABLE"
}

variable "tags" {
    description = "The key-value maps for tagging"
    type        = map(string) 
    default     = {}
}

##### EC2 Variables

variable "legacy_instance_id" {
        description = "Name of the instance to be created"
        default = "i-0671f0855f36b213c"
}
variable "test_instance_name" {
        description = "Name of the instance to be created"
        default = "Test-2023"
}
variable "prod_instance_name" {
        description = "Name of the instance to be created"
        default = "Production-2023"
}
variable "instance_type" {
        default = "t3.medium" 
}
variable "subnet_id" {
        default = "subnet-08aada89e3bbe5be8"
}

#Amazon Linux 2023 AMI
variable "ami_id" {
        description = "The AMI to use"
        default = "ami-0230bd60aa48260c6"
}

variable "vpc_id" {
        description = "VPC of the project"
        default = "vpc-049c2f37b4d6cadd1" 
}
variable "security_group_id" {
        description = "Security group of the project"
        default = "sg-032260145c658e92e" 
}
variable "number_of_instances" {
        description = "number of instances to be created"
        default = 1
}

variable "key_name" {
        description = "Key name of the Key Pair to use for the instance"
        default = "ISDT2023"
}
variable "volume_size" {
        description = "Size of Volume in gigibytes"
        default = "40"
}
variable "test_private_ip" {
        description = "IP of Server"
        default = "10.194.52.215"
}
variable "prod_private_ip" {
        description = "IP of Server"
        default = "10.194.52.247"
}

## S3 Variables
variable "encrypt_type" {
    description = "Provide type of encryption here"
    type        = string
    default     = "KMS"
}

# Input variable: S3 bucket name
variable "bucket_name" {
  description = "The name of the S3 bucket. Must be globally unique."
  default     = "sdt-storage-001"
}

##### ECS Variables - not currently implemented

variable "ecs_name" {
    description = "The name of the ECS Cluster"
    type        = string
    default     = "DiagnosticTool"
}
variable "environment" {
    description = "The name of the ECS Cluster"
    type        = string
    default     = "Dev"
}

variable "ecs_task_desired_count" {
  description = "How many ECS tasks should run in parallel"
  type        = number
  default      = 0
}

variable "ecs_task_min_count" {
  description = "How many ECS tasks should minimally run in parallel"
  default     = 2
  type        = number
}

variable "ecs_task_max_count" {
  description = "How many ECS tasks should maximally run in parallel"
  default     = 10
  type        = number
}

variable "ecs_task_deployment_minimum_healthy_percent" {
  description = "How many percent of a service must be running to still execute a safe deployment"
  default     = 50
  type        = number
}

variable "ecs_task_deployment_maximum_percent" {
  description = "How many additional tasks are allowed to run (in percent) while a deployment is executed"
  default     = 100
  type        = number
}

variable "cpu_target_tracking_desired_value" {
  description = "Target tracking for CPU usage in %"
  default     = 70
  type        = number
}

variable "memory_target_tracking_desired_value" {
  description = "Target tracking for memory usage in %"
  default     = 80
  type        = number
}

variable "target_capacity" {
  description = "Amount of resources of container instances that should be used for task placement in %"
  default     = 100
  type        = number
}

variable "container_port" {
  description = "Port of the container"
  type        = number
  default     = 80
}

variable "cpu_units" {
  description = "Amount of CPU units for a single ECS task"
  default     = 256
  type        = number
}

variable "memory" {
  description = "Amount of memory in MB for a single ECS task"
  default     = 512
  type        = number
}


