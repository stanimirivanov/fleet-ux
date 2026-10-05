import { RegistryProvider } from '@effect/atom-solid';
import { Route, Router } from '@solidjs/router';
import { render } from 'solid-js/web';
import { App } from './app/App';
import './styles.css';

const root = document.getElementById('root');
if (!root) {
  throw new Error('FleetIQ root element is missing');
}

render(
  () => (
    <RegistryProvider>
      <Router>
        <Route path="/" component={App} />
      </Router>
    </RegistryProvider>
  ),
  root,
);
