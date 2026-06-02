# mcp-jersey-opendata

Jersey Open Data MCP — opendata.gov.je, the official statistics / open-data

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 705+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `list_organizations` | List publishing organizations (Jersey government departments/agencies, e.g. Statistics Jersey) on opendata.gov.je (CKAN organization_list). |
| `list_groups` | List thematic groups/categories on opendata.gov.je, e.g. "Economy and business", "Coronavirus (COVID-19)" (CKAN group_list). |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "jersey-opendata": {
      "url": "https://gateway.pipeworx.io/jersey-opendata/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 705+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Jersey Opendata data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [All tools and guides](https://github.com/pipeworx-io/examples)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
