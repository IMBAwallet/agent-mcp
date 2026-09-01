# IMBA Agent MCP (Docker)

[![agent-mcp MCP server](https://glama.ai/mcp/servers/IMBAwallet/agent-mcp/badges/card.svg)](https://glama.ai/mcp/servers/IMBAwallet/agent-mcp)
[![agent-mcp MCP server](https://glama.ai/mcp/servers/IMBAwallet/agent-mcp/badges/score.svg)](https://glama.ai/mcp/servers/IMBAwallet/agent-mcp)

Stdio images for the prepaid **IMBA Agent API**. They install the public npm
packages only. This repository does not contain API keys, Ed25519 private keys,
or registry seeds.

Default `Dockerfile` is the **docs** server so Glama and other scanners can
build without secrets. Spend is a separate image.

| File | npm | Registry name | What it does |
|---|---|---|---|
| `Dockerfile` / `Dockerfile.docs` | `@imba_wallet/agent-mcp-docs` | `com.imbawallet/agent-docs` | Policy, HowTo, what agents buy. No money. |
| `Dockerfile.spend` | `@imba_wallet/agent-mcp` | `com.imbawallet/agent` | USDT TRC-20 + Visa prepaid / eSIM / gift cards with **your** key. No withdraw. |

Hosted remotes: [docs](https://imbawallet.com/mcp/docs) · [spend](https://imbawallet.com/mcp/spend)

Playbooks: [what agents buy](https://imbawallet.com/agent_use_cases_about_en.html) · [HowTo](https://imbawallet.com/agent_api_about_en.html) · [API docs](https://api-docs.imbawallet.com/agent)

## What agents buy

IMBA issues the **payment instrument**, not the booking:

- **Visa/MasterCard prepaid** — airlines, hotels, SaaS, or a datacenter that bills a card
- **Travel eSIM** — cheap mobile data
- **Gift cards** — live catalog (~20,000 positions; Apple, Steam, Google Play — search, do not hard-code a SKU)

ChatGPT Actions must not call spend.

## Install (stdio)

Docs (no secrets):

```bash
npx -y @imba_wallet/agent-mcp-docs@0.1.5
```

```json
{
  "mcpServers": {
    "imba-agent-docs": {
      "command": "npx",
      "args": ["-y", "@imba_wallet/agent-mcp-docs@0.1.5"]
    }
  }
}
```

Spend (operator key):

```json
{
  "mcpServers": {
    "imba-agent": {
      "command": "npx",
      "args": ["-y", "@imba_wallet/agent-mcp"],
      "env": {
        "IMBA_AGENT_CLIENT_ID": "YOUR_CLIENT_ID",
        "IMBA_AGENT_PRIVATE_KEY": "-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----"
      }
    }
  }
}
```

Claude Code marketplace (this repo):

```text
/plugin marketplace add IMBAwallet/agent-mcp
/plugin install imba-agent@imba-agent
```

Agent skill: `npx skills add IMBAwallet/agent-mcp --skill imba-agent`

## Docker

```bash
docker build -t imba-agent-docs .
docker run -i --rm imba-agent-docs

docker build -f Dockerfile.spend -t imba-agent-spend .
docker run -i --rm \
  -e IMBA_AGENT_CLIENT_ID=YOUR_CLIENT_ID \
  -e IMBA_AGENT_PRIVATE_KEY=YOUR_PKCS8_PEM_OR_BASE64URL \
  imba-agent-spend
```

Not a ChatGPT money plugin. Raising `agent_tier` does not unlock withdraw.

## Glama listing

Repo: [glama.ai/mcp/servers/IMBAwallet/agent-mcp](https://glama.ai/mcp/servers/IMBAwallet/agent-mcp)

`glama.json` lists GitHub user `clnt2021`. After a push to `main`:

1. Sign in to Glama with that GitHub account.
2. Open the listing → **Sync Server** (mirror can lag).
3. **Claim ownership** if Maintainers still shows 0 (org repos need `glama.json` + claim).
4. **Make Release** against the **root `Dockerfile`** (docs). Do not release `Dockerfile.spend` in Glama — the sandbox has no operator key.

Quality grades (tool definitions / coherence) appear only after that Glama release, not after a GitHub tag.
