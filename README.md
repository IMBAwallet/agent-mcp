# IMBA Agent MCP (Docker)

Stdio images for the prepaid IMBA Agent API. They install the **public npm**
packages only. This repository does not contain API keys, Ed25519 private keys,
or registry seeds.

| Dockerfile | npm | Registry name | What it does |
|---|---|---|---|
| `Dockerfile.docs` | `@imba_wallet/agent-mcp-docs` | `com.imbawallet/agent-docs` | Policy and HowTo. No money. |
| `Dockerfile.spend` | `@imba_wallet/agent-mcp` | `com.imbawallet/agent` | USDT TRC-20 deposit + catalog buy with **your** key. No withdraw. |

Hosted remotes: `https://imbawallet.com/mcp/docs` and `https://imbawallet.com/mcp/spend`.

Human docs: https://imbawallet.com/agent_api_about_en.html  
API docs: https://api-docs.imbawallet.com/agent

## Build

```bash
docker build -f Dockerfile.docs -t imba-agent-docs .
docker build -f Dockerfile.spend -t imba-agent-spend .
```

## Run

Docs (no secrets):

```bash
docker run -i --rm imba-agent-docs
```

Spend: pass **your** `client_id` and PKCS#8 key at runtime. Do not commit them.
IMBA does not store a shared spend key in this image.

```bash
docker run -i --rm \
  -e IMBA_AGENT_CLIENT_ID=YOUR_CLIENT_ID \
  -e IMBA_AGENT_PRIVATE_KEY=YOUR_PKCS8_PEM_OR_BASE64URL \
  imba-agent-spend
```

Not a ChatGPT money plugin. Raising `agent_tier` does not unlock withdraw.
