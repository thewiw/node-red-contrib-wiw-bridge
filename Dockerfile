ARG NODE_VERSION=10
FROM nodered/node-red-docker:v${NODE_VERSION}

ARG VERSION=undefined
LABEL vendor="The WiW"
LABEL maintener="The WiW (contact@thewiw.com)"
LABEL com.thewiw.version="${VERSION}"

RUN npm install node-red-contrib-s7 node-red-dashboard node-red-contrib-uuid

ADD --chown=node-red:node-red ./ /usr/src/node-red/contrib/node-red-contrib-wiw-bridge/
RUN npm install contrib/node-red-contrib-wiw-bridge

RUN cp /usr/src/node-red/node_modules/node-red/settings.js /data/settings.js && \
    sed -i "s=//httpStatic: '[^']*'=httpStatic: '/data/resources/'=" /data/settings.js && \
    mkdir -p /data/resources/node-red-contrib-wiw-bridge/resources/ && \
    cp -r /usr/src/node-red/contrib/node-red-contrib-wiw-bridge/resources /data/resources/node-red-contrib-wiw-bridge/

VOLUME ["/data"]

