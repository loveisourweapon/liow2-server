FROM node:0.12.4
MAINTAINER Ben Booth <bkbooth@gmail.com>

EXPOSE 3000

ENV APP_DIR /usr/src/app/
RUN mkdir -p ${APP_DIR}
WORKDIR ${APP_DIR}

# Copy all app files across
COPY . ${APP_DIR}
VOLUME ${APP_DIR}

# Install nodemon and node dependencies
RUN npm install -g nodemon && \
    npm install && \
    npm cache clear

# Run with nodemon
CMD ["nodemon"]
