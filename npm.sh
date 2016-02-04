#!/bin/bash

# Always pull latest image
docker pull mhart/alpine-node:4

docker run \
    --rm -it \
    --name=npm-$(( $RANDOM % 99999 )) \
    -v $(pwd):/code \
    -w "/code" \
    mhart/alpine-node:4 npm --quiet ${*}
