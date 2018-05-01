#!/bin/bash
imageName=falconer/node-oil-server:v0.0.1
containerName=server

docker build -t $imageName -f Dockerfile  .

echo Delete old container...
docker rm -f $containerName

echo Run new container...
docker run -d --env-file env.list -p 8080:8080 --name $containerName $imageName
