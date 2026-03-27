FROM docker.n8n.io/n8nio/n8n:latest

USER root

# Install the custom node in a path NOT overlapped by the .n8n volume
RUN mkdir -p /opt/custom-nodes/n8n-nodes-groupwise-imap

COPY package.json /opt/custom-nodes/n8n-nodes-groupwise-imap/
COPY dist/ /opt/custom-nodes/n8n-nodes-groupwise-imap/dist/

WORKDIR /opt/custom-nodes/n8n-nodes-groupwise-imap
RUN npm install --omit=dev --ignore-scripts 2>/dev/null || true

RUN chown -R node:node /opt/custom-nodes

USER node
WORKDIR /home/node
