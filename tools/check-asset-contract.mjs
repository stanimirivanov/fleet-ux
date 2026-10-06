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
  provenance.path !== 'contracts/http/fleetiq-v1-ui-baseline.openapi.json'
) {
  throw new Error('OpenAPI source provenance is missing or invalid');
}
const contract = JSON.parse(bytes.toString('utf8'));
if (
  contract.openapi !== '3.1.1' ||
  contract.info?.version !== '1.0.0-baseline.1' ||
  contract.paths?.['/api/v1/tenants/{tenant_id}/assets']?.get?.operationId !==
    'listAssets' ||
  contract.components?.schemas?.AssetPage === undefined
) {
  throw new Error('Unexpected asset catalogue contract revision');
}
console.log(`Pinned FleetIQ asset contract matches ${provenance.commit}`);
