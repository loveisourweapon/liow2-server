#!/bin/bash

docker run --rm \
  --name=mongorestore-$(( $RANDOM % 99999 )) \
  --link=liow2server_mongo_1:db \
  -v $(pwd)/data:/data-in \
  -w "/" \
  mongo mongorestore --host=db --gzip --archive=/data-in/liow2.archive.gz --db=liow2
