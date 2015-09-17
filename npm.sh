#!/bin/bash

docker run \
    --rm -it \
    --name=npm-$(( $RANDOM % 99999 )) \
    -v $(pwd):/code \
    -w "/code" \
    node:4.0 npm ${*}
