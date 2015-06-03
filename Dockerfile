FROM node:onbuild
MAINTAINER Ben Booth <bkbooth@gmail.com>

EXPOSE 3000

ENV APP_DIR /usr/src/myapp

COPY . ${APP_DIR}
VOLUME ${APP_DIR}
WORKDIR ${APP_DIR}
