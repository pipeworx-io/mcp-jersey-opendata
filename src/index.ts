interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Jersey Open Data MCP — opendata.gov.je, the official statistics / open-data
 * portal of the Channel Island of Jersey (a British Crown Dependency),
 * maintained by Statistics Jersey. Runs on CKAN.
 *
 * Auth: none (keyless). Docs: https://docs.ckan.org/en/latest/api/
 *
 * Notes for callers:
 * - Datasets cover Jersey official statistics: population & migration,
 *   census, economy, prices/RPI, business, environment, health, and
 *   Freedom-of-Information disclosures. Metadata and values are in English.
 * - Many resources expose row-level data via the CKAN datastore
 *   (`datastore_active: true`) — this portal genuinely has it enabled, so
 *   `datastore_query` returns actual table rows (e.g. population projections
 *   by year/age/sex), not just file links. Pull a `resource_id` from
 *   `dataset_details` and check its `datastore_active` flag first.
 * - Resources without datastore_active expose a CSV/file `url` for download.
 */


const BASE = 'https://opendata.gov.je/api/3/action';
const UA = 'pipeworx-mcp-jersey-opendata/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'search_datasets',
    description:
      "Search the Government of Jersey open-data catalogue (opendata.gov.je, CKAN package_search). Jersey is a Channel Island Crown Dependency; data is published by Statistics Jersey. Returns matching datasets with titles/descriptions/resources (English).",
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search terms. e.g. "population", "RPI inflation", "census", "GVA".' },
        fq: { type: 'string', description: 'Solr filter query, e.g. "organization:statistics-jersey" or "groups:economy-and-business".' },
        rows: { type: 'number', description: 'Max results, 1-1000 (default 25).' },
        start: { type: 'number', description: '0-based offset for paging.' },
        sort: { type: 'string', description: 'Sort spec, e.g. "metadata_modified desc".' },
      },
      required: ['query'],
    },
  },
  {
    name: 'dataset_details',
    description:
      'Full Jersey dataset record by id or slug (CKAN package_show), including its resources. Read each resource\'s "id" (resource_id), download "url", and "datastore_active" flag to know which resources can be queried row-by-row via datastore_query.',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string', description: 'Dataset id or slug, e.g. "population-projections".' } },
      required: ['id'],
    },
  },
  {
    name: 'datastore_query',
    description:
      'Read actual table rows from a Jersey resource via CKAN datastore_search. Works only for resources with datastore_active=true (get the resource_id from dataset_details). Returns parsed records plus field definitions — e.g. population projections by Year/Age/Sex.',
    inputSchema: {
      type: 'object',
      properties: {
        resource_id: { type: 'string', description: 'Resource UUID from dataset_details, e.g. "6e222cd7-d296-429a-abea-09001dcc45f6".' },
        q: { type: 'string', description: 'Full-text filter across the table.' },
        filters: { type: 'object', description: 'Exact-match column filters, e.g. {"Sex":"F","Year":2025}.' },
        limit: { type: 'number', description: 'Max rows, 1-32000 (default 100).' },
        offset: { type: 'number', description: '0-based row offset for paging.' },
      },
      required: ['resource_id'],
    },
  },
  {
    name: 'list_organizations',
    description: 'List publishing organizations (Jersey government departments/agencies, e.g. Statistics Jersey) on opendata.gov.je (CKAN organization_list).',
    inputSchema: {
      type: 'object',
      properties: { limit: { type: 'number', description: 'Max orgs, 1-1000 (default 100).' } },
    },
  },
  {
    name: 'list_groups',
    description: 'List thematic groups/categories on opendata.gov.je, e.g. "Economy and business", "Coronavirus (COVID-19)" (CKAN group_list).',
    inputSchema: {
      type: 'object',
      properties: { limit: { type: 'number', description: 'Max groups, 1-1000 (default 100).' } },
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'search_datasets': {
      const params = new URLSearchParams({
        q: reqStr(args, 'query', '"population" or "RPI inflation"'),
        rows: String(clamp(args.rows, 25, 1, 1000)),
        start: String(Math.max(0, (args.start as number) ?? 0)),
      });
      if (args.fq) params.set('fq', String(args.fq));
      if (args.sort) params.set('sort', String(args.sort));
      return ckanGet(`/package_search?${params}`);
    }
    case 'dataset_details':
      return ckanGet(`/package_show?id=${encodeURIComponent(reqStr(args, 'id', '"population-projections"'))}`);
    case 'datastore_query': {
      const params = new URLSearchParams({
        resource_id: reqStr(args, 'resource_id', '"6e222cd7-d296-429a-abea-09001dcc45f6"'),
        limit: String(clamp(args.limit, 100, 1, 32000)),
        offset: String(Math.max(0, (args.offset as number) ?? 0)),
      });
      if (args.q) params.set('q', String(args.q));
      if (args.filters && typeof args.filters === 'object') params.set('filters', JSON.stringify(args.filters));
      return ckanGet(`/datastore_search?${params}`);
    }
    case 'list_organizations': {
      const params = new URLSearchParams({ all_fields: 'true', limit: String(clamp(args.limit, 100, 1, 1000)) });
      return ckanGet(`/organization_list?${params}`);
    }
    case 'list_groups': {
      const params = new URLSearchParams({ all_fields: 'true', limit: String(clamp(args.limit, 100, 1, 1000)) });
      return ckanGet(`/group_list?${params}`);
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function ckanGet(path: string): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: 'application/json', 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Jersey: ${res.status} ${await res.text().then((t) => t.slice(0, 200))}`);
  const json = (await res.json()) as { success?: boolean; error?: { message?: string }; result?: unknown };
  if (json.success === false) throw new Error(`Jersey: ${json.error?.message ?? 'request failed'}`);
  return json.result ?? json;
}

function clamp(v: unknown, dflt: number, lo: number, hi: number): number {
  const n = typeof v === 'number' ? v : dflt;
  return Math.min(hi, Math.max(lo, n));
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) {
    throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  }
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
