FROM node:0.12.4
MAINTAINER Ben Booth <bkbooth@gmail.com>

# Install nodemon
RUN npm install -g nodemon && \
    npm cache clear

EXPOSE 3000

ENV APP_DIR /usr/src/app
RUN mkdir -p ${APP_DIR}
WORKDIR ${APP_DIR}

# Install node dependencies
COPY package.json ${APP_DIR}/
RUN npm install

# Copy all app files across
COPY . ${APP_DIR}
VOLUME ${APP_DIR}

# Run with nodemon
CMD ["nodemon"]
