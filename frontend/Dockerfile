# note: expected build context is the git root directory
FROM node
ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_OPTIONS --openssl-legacy-provider

ADD . /build

WORKDIR /build

RUN yarn global add serve

RUN yarn install
RUN yarn build

ENTRYPOINT npm run start