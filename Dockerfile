# Default image for Glama / directories that look for ./Dockerfile.
# Read-only docs MCP: no secrets, no spend. Spend is Dockerfile.spend.
FROM node:22-alpine
LABEL org.opencontainers.image.source="https://github.com/IMBAwallet/agent-mcp"
LABEL org.opencontainers.image.description="IMBA Agent Docs MCP: Visa prepaid, eSIM, gift-card playbooks. No money."
LABEL io.modelcontextprotocol.server.name="com.imbawallet/agent-docs"
RUN npm install -g @imba_wallet/agent-mcp-docs@0.1.5 \
  && npm cache clean --force
USER node
ENTRYPOINT ["agent-mcp-docs"]
