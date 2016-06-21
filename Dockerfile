FROM mhart/alpine-node:6
MAINTAINER Ben Booth <bkbooth@gmail.com>

EXPOSE 3000

# Set Timezone
ENV TZ Australia/Sydney

# Setup application directory
ENV APP_DIR /usr/src/app/
RUN mkdir -p ${APP_DIR}
WORKDIR ${APP_DIR}
VOLUME ${APP_DIR}

# Copy all application files
COPY . ${APP_DIR}

# Install nodemon and node dependencies
RUN npm install --quiet -g nodemon && \
    npm install --quiet && \
    npm cache clear

# Run with nodemon
CMD nodemon --exec "npm start"
