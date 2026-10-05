import { RegistryProvider } from '@effect/atom-solid';
import { Route, Router } from '@solidjs/router';
import { render } from 'solid-js/web';
import { AppShell } from './app/AppShell';
import { DesignSystemPage } from './app/DesignSystemPage';
import { AssetsPage, NotFoundPage, OverviewPage } from './app/WorkspacePages';
import './styles.css';

const root = document.getElementById('root');
if (!root) {
  throw new Error('FleetIQ root element is missing');
}

render(
  () => (
    <RegistryProvider>
      <Router root={AppShell}>
        <Route path="/" component={OverviewPage} />
        <Route path="/assets" component={AssetsPage} />
        <Route path="/design-system" component={DesignSystemPage} />
        <Route path="*" component={NotFoundPage} />
      </Router>
    </RegistryProvider>
  ),
  root,
);
