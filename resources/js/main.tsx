import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { parseBootstrapConfig } from '@/utils/bootstrap';
import App from '@/app';
import { AppContextProvider } from '@/context/AppContext';

import '../css/app.css';

const bootNode = document.getElementById('eval-harness-ui-bootstrap');
const rootNode = document.getElementById('eval-harness-ui-root');

if (!rootNode || !bootNode) {
  throw new Error('Eval Harness UI mount nodes not found');
}

const rawConfig = bootNode.textContent;
const appConfig = parseBootstrapConfig(rawConfig);
const apiBase = rootNode.dataset.apiBase ?? '/admin/eval-harness/api';
const routeBase = rootNode.dataset.routeBase?.trim() ?? '';
const baseName = routeBase === '' ? undefined : `/${routeBase.replace(/\/+/g, '/').replace(/^\/+|\/+$/g, '')}`;

createRoot(rootNode).render(
  <StrictMode>
    <BrowserRouter basename={baseName}>
      <AppContextProvider apiBase={apiBase} config={appConfig}>
        <App title="Eval Harness UI" version={appConfig.ui_version} />
      </AppContextProvider>
    </BrowserRouter>
  </StrictMode>,
);
