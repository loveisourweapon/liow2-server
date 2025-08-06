FROM mhart/alpine-node:8
MAINTAINER Ben Booth <hey@benbooth.dev>

# Add build dependencies for bcrypt and envsubst (gettext)
RUN apk add --no-cache make gcc g++ python gettext

# Setup application directory
ENV APP_DIR /usr/src/app/
RUN mkdir -p ${APP_DIR}
WORKDIR ${APP_DIR}

# Copy all application files
COPY . ${APP_DIR}
COPY config.example.js ${APP_DIR}/config.js

# Install nodemon and node dependencies
RUN npm install --quiet -g nodemon && \
    npm install --quiet && \
    npm cache clear --force

# Generate apidocs from environment variables
RUN npm run config-env && \
    npm run docs

# Set Timezone
ENV TZ Australia/Sydney

# Open app port
EXPOSE 3000

# Run with npm start
CMD [ "npm", "start" ]
