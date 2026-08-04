# mcp-jersey-opendata

Jersey Open Data MCP — opendata.gov.je, the official statistics / open-data

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `search_datasets` | Search the Government of Jersey open-data catalogue (opendata.gov.je, CKAN package_search). Jersey is a Channel Island Crown Dependency; data is published by Statistics Jersey. Returns matching datasets with titles/descriptions/resources (English). |
| `dataset_details` | Full Jersey dataset record by id or slug (CKAN package_show), including its resources. Read each resource's "id" (resource_id), download "url", and "datastore_active" flag to know which resources can be queried row-by-row via datastore_query. |
| `datastore_query` | Read actual table rows from a Jersey resource via CKAN datastore_search. Works only for resources with datastore_active=true (get the resource_id from dataset_details). Returns parsed records plus field definitions — e.g. population projections by Year/Age/Sex. |
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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

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

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
