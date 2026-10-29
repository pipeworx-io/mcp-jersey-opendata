# mcp-jersey-opendata

Jersey Open Data MCP — opendata.gov.je, the official statistics / open-data portal of the Channel Island of Jersey (a British Crown Dependency), maintained by Statistics Jersey. Runs on CKAN.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1856+ live data sources. This is an independent, unofficial integration — not affiliated with, endorsed by, or published by the upstream provider.

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

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/jersey-opendata/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1856+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## No MCP client? Call it over HTTP

```bash
curl -X POST https://gateway.pipeworx.io/v1/tools/jersey_opendata_search_datasets \
  -H 'Content-Type: application/json' \
  -d '{"query":"population"}'
```

No account needed for the first calls. Inspect any tool: `GET https://gateway.pipeworx.io/v1/tools/jersey_opendata_search_datasets`. Find one: `POST https://gateway.pipeworx.io/v1/tools/search_packs` with `{"query":"..."}`.

## Run it from npm

`@pipeworx/mcp-jersey-opendata` is a local stdio bridge to the Pipeworx gateway: your MCP client
starts it with `npx`, and it forwards every call to the same
`https://gateway.pipeworx.io/jersey-opendata/mcp` endpoint shown above. It needs network access;
there is no offline mode.

```json
{
  "mcpServers": {
    "jersey-opendata": {
      "command": "npx",
      "args": ["-y", "@pipeworx/mcp-jersey-opendata"]
    }
  }
}
```

Without a key it calls anonymously, capped at 50 calls a day. A free account
raises that to 200 a day: get a key at https://pipeworx.io/signup and add
`"env": { "PIPEWORX_API_KEY": "<your key>" }` to the server entry.
The key is sent as a Bearer token, the same way a hosted connection sends it,
so calls are metered and billed exactly as they are there.

It lists **only** this pack's tools by default. Set `PIPEWORX_META_TOOLS=1` to
also list `ask_pipeworx` and the other gateway-wide tools.

Behind an HTTPS proxy: Node's built-in `fetch` does not read `HTTPS_PROXY` by
default. Newer Node releases honour it when `NODE_USE_ENV_PROXY=1` is set; check
your Node version's documentation.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Jersey Opendata data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
