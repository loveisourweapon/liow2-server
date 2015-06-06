FROM node:0.12.4
MAINTAINER Ben Booth <bkbooth@gmail.com>

EXPOSE 3000

# Setup application directory
ENV APP_DIR /usr/src/app/
RUN mkdir -p ${APP_DIR}
WORKDIR ${APP_DIR}
VOLUME ${APP_DIR}

# Copy all application files
COPY . ${APP_DIR}

# Install nodemon and node dependencies
RUN npm install -g nodemon && \
    npm install && \
    npm cache clear

# Run with nodemon
CMD ["nodemon"]
