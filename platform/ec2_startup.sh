#!/bin/bash
echo -e "Installing yum updates" > /initiate.txt
sudo yum -y update
echo "Installing docker" >> /initiate.txt
sudo yum -y install docker
echo "Installing git" >> /initiate.txt
sudo yum -y install git
echo "Adding user to docker group" >> /initiate.txt
usermod -aG docker ec2-user
