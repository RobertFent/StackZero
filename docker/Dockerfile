FROM node:24-slim

WORKDIR /stackzero

# install os deps
RUN apt-get update && apt-get install -y \
  python3 \
  make \
  g++ \
  tzdata

# set timezone to Europe/Berlin
ENV TZ=Europe/Berlin

# copy website deps and install them
COPY package.json .
COPY package-lock.json .
ENV SKIP_POSTINSTALL=true
RUN npm install

# copy rest of the app and prepare launch
COPY core/ core
COPY app/ app
COPY data/ data
COPY static/ static

# bake app version into image
ARG APP_VERSION
ENV APP_VERSION=$APP_VERSION

CMD [ "npm", "start" ]