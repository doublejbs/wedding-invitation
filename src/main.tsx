import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import InvitationPageView from './components/InvitationPageView';
import './styles/InvitationPage.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <InvitationPageView />
  </StrictMode>,
);
