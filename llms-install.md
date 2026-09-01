# Install IMBA Agent MCP

Cline and other agents: use this file plus README.md. Public repo only. No API keys in git.

## Docs (default, no secrets)

```bash
npx -y @imba_wallet/agent-mcp-docs@0.1.4
```

```json
{
  "mcpServers": {
    "imba-agent-docs": {
      "command": "npx",
      "args": ["-y", "@imba_wallet/agent-mcp-docs@0.1.4"]
    }
  }
}
```

Remote Streamable HTTP: `https://imbawallet.com/mcp/docs`

## Spend (operator key)

Do not start spend without the operator Ed25519 pair. IMBA does not host a shared spend wallet. No withdraw.

```json
{
  "mcpServers": {
    "imba-agent": {
      "command": "npx",
      "args": ["-y", "@imba_wallet/agent-mcp@0.1.4"],
      "env": {
        "IMBA_AGENT_CLIENT_ID": "YOUR_CLIENT_ID",
        "IMBA_AGENT_PRIVATE_KEY": "YOUR_PKCS8_PEM_OR_BASE64URL"
      }
    }
  }
}
```

Remote: `https://imbawallet.com/mcp/spend` with headers `X-IMBA-Agent-Client-Id` and `X-IMBA-Agent-Private-Key`.

Docker: root `Dockerfile` is docs. Spend is `Dockerfile.spend`.

HowTo: https://imbawallet.com/agent_api_about_en.html
