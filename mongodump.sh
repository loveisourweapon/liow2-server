#!/bin/bash

CONTAINER_NAME="liow2server_mongo_1"
ARCHIVE_NAME="liow2.archive.gz"

docker exec ${CONTAINER_NAME} mongodump --archive --gzip --db=liow2 > data/${ARCHIVE_NAME}
