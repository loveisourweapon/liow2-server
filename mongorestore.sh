#!/bin/bash

docker run --rm \
  --name=mongorestore-$(( $RANDOM % 99999 )) \
  --link=liow2-server-mongo-1:db \
  --net=liow2-server_default \
  -v $(pwd)/data:/data-in \
  -w "/" \
  mongo:3.2 mongorestore --host=db --gzip --archive=/data-in/liow2.archive.gz --db=liow2
