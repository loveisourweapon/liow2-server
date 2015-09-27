#!/bin/bash

docker run --rm \
    --name=mongorestore-$(( $RANDOM % 99999 )) \
    --link=liow2server_mongo_1:db \
    -v $(pwd)/data/dump:/dump \
    -w "/" \
    mongo mongorestore -h db
