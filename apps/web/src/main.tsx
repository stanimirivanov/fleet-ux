import { Route, Router } from '@solidjs/router';
import { render } from 'solid-js/web';
import { AssetsPage, FleetOverviewPage } from '#features/assets';
import { AppShell } from './app/AppShell';
import { DesignSystemPage } from './app/DesignSystemPage';
import { APP_ROUTES } from './app/route-metadata';
import { NotFoundPage } from './app/WorkspacePages';
import './styles.css';

const root = document.getElementById('root');
if (!root) {
  throw new Error('FleetIQ root element is missing');
}

render(
  () => (
    <Router root={AppShell}>
      <Route path={APP_ROUTES.overview.path} component={FleetOverviewPage} />
      <Route path={APP_ROUTES.assets.path} component={AssetsPage} />
      <Route path={APP_ROUTES.designSystem.path} component={DesignSystemPage} />
      <Route path="*" component={NotFoundPage} />
    </Router>
  ),
  root,
);
