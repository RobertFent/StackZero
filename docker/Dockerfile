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
RUN npm install

# copy rest of the app and prepare launch
COPY app/ app/
COPY static/ static/

COPY app app
COPY core core
COPY static static
COPY package.json .
COPY package-lock.json .

CMD [ "npm", "start" ]