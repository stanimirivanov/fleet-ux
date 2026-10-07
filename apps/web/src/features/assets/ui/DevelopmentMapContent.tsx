import { getDemoMapWorkbench } from '../demo/map-fixture';
import { MapWorkspace } from './map/MapWorkspace';

const sample = getDemoMapWorkbench('tenant-a');

/** Local design scene; Vite excludes this module from production builds. */
export default function DevelopmentMapContent() {
  return <MapWorkspace workbench={sample} />;
}
