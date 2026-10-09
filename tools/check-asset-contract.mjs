import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const contractUrl = new URL(
  '../contracts/http/fleetiq-v1-ui-baseline.openapi.json',
  import.meta.url,
);
const provenanceUrl = new URL('../contracts/http/source.json', import.meta.url);
const [bytes, provenance] = await Promise.all([
  readFile(contractUrl),
  readFile(provenanceUrl, 'utf8').then(JSON.parse),
]);
const digest = createHash('sha256').update(bytes).digest('hex');
if (digest !== provenance.sha256) {
  throw new Error(
    'Pinned OpenAPI digest differs from contracts/http/source.json',
  );
}
if (
  provenance.repository !== 'fleetiq-platform' ||
  provenance.remote !== 'https://github.com/stanimirivanov/fleetiq-platform' ||
  !/^[0-9a-f]{40}$/.test(provenance.commit) ||
  provenance.path !== 'contracts/http/dist/openapi.json'
) {
  throw new Error('OpenAPI source provenance is missing or invalid');
}
const contract = JSON.parse(bytes.toString('utf8'));
if (
  contract.openapi !== '3.1.1' ||
  contract.info?.version !== '1.0.0-baseline.3' ||
  contract.paths?.['/api/v1/tenants/{tenant_id}/assets']?.get?.operationId !==
    'listAssets' ||
  contract.components?.schemas?.AssetPage === undefined ||
  contract.components?.schemas?.OperatorSession === undefined ||
  contract.components?.securitySchemes?.cookieAuth === undefined
) {
  throw new Error('Unexpected asset catalogue contract revision');
}
const operations = {
  '/api/v1': ['get', 'getApiVersion'],
  '/api/v1/tenants/{tenant_id}/assets': ['get', 'listAssets'],
  '/api/v1/tenants/{tenant_id}/assets/{asset_id}': ['get', 'getAsset'],
  '/api/v1/tenants/{tenant_id}/assets/{asset_id}/relationships': [
    'get',
    'listAssetRelationships',
  ],
  '/api/v1/tenants/{tenant_id}/assets/{asset_id}/signal-bindings': [
    'get',
    'listAssetSignalBindings',
  ],
  '/api/v1/tenants/{tenant_id}/signal-bindings': [
    'get',
    'listSourceSignalBindings',
  ],
  '/api/v1/tenants/{tenant_id}/asset-types/{type_id}/versions/{version}': [
    'get',
    'getAssetTypeDefinition',
  ],
  '/api/v1/tenants/{tenant_id}/properties/{property_id}/versions/{version}': [
    'get',
    'getPropertyDefinition',
  ],
  '/api/v1/tenants/{tenant_id}/relationship-types/{type_id}/versions/{version}':
    ['get', 'getRelationshipTypeDefinition'],
  '/api/v1/auth/login': ['get', 'beginOperatorLogin'],
  '/api/v1/auth/callback': ['get', 'completeOperatorLogin'],
  '/api/v1/auth/session': ['get', 'getOperatorSession'],
  '/api/v1/auth/logout': ['post', 'endOperatorSession'],
};
for (const [path, [method, operationId]] of Object.entries(operations)) {
  if (contract.paths?.[path]?.[method]?.operationId !== operationId) {
    throw new Error(`Missing or changed published operation ${operationId}`);
  }
}
const cookie = contract.components.securitySchemes.cookieAuth;
if (
  cookie.type !== 'apiKey' ||
  cookie.in !== 'cookie' ||
  cookie.name !== '__Host-fleetiq-session'
) {
  throw new Error('Unexpected browser-session security declaration');
}
console.log(
  `Pinned FleetIQ browser metadata contract matches ${provenance.commit}`,
);
