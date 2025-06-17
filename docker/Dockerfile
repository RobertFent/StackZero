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
COPY core/ core
COPY template/app app
COPY template/data data
COPY template/static static

CMD [ "npm", "start" ]