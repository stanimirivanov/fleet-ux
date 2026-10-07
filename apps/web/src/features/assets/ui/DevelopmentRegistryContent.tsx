import {
  getDemoRegistry,
  getDemoRegistryDetail,
} from '../demo/registry-fixture';
import { RegistryWorkspace } from './registry/RegistryWorkspace';

const tenantId = 'tenant-a';
const assets = getDemoRegistry(tenantId);

/** Synthetic commissioning scene; Vite excludes this module from production. */
export default function DevelopmentRegistryContent() {
  return (
    <RegistryWorkspace
      tenantId={tenantId}
      assets={assets}
      getDetail={(assetId) => getDemoRegistryDetail(tenantId, assetId)}
    />
  );
}
