##Create EC2 instance
data "aws_instance" "existing" {
    instance_id = var.legacy_instance_id
}

##Create EC2 instances
##Test Instance
resource "aws_instance" "ec2_instance" {
    ami = var.ami_id
    count = var.number_of_instances
    subnet_id = var.subnet_id
    instance_type = var.instance_type
    key_name = var.key_name
     
    root_block_device {
      volume_size = var.volume_size
    } 
    
    vpc_security_group_ids = [var.security_group_id]
    private_ip = var.test_private_ip
    user_data = "${file("ec2_startup.sh")}"

    #uncomment this when you are happy with the instance
    lifecycle {
      ignore_changes = [ user_data ]
    }
    tags =  {
        Name = var.test_instance_name
    } 
}
##Prod Instance
resource "aws_instance" "prod_ec2_instance" {
    ami = var.ami_id
    count = var.number_of_instances
    subnet_id = var.subnet_id
    instance_type = var.instance_type
    key_name = var.key_name
     
    root_block_device {
      volume_size = var.volume_size
    } 
    
    vpc_security_group_ids = [var.security_group_id]
    private_ip = var.prod_private_ip
    user_data = "${file("ec2_startup.sh")}"
    #uncomment this when you are happy with the instance
    #lifecycle {
    #  ignore_changes = [ user_data ]
    #}
    tags =  {
        Name = var.prod_instance_name
    } 
}
 

