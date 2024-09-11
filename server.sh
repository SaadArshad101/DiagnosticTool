#!/bin/bash
docker-compose down
docker rm $(docker ps -a -q)
docker rmi $(docker images -q)
docker-compose build
docker-compose up
# uncomment the below line to run the process in the background for debugging
# docker-compose up -d
