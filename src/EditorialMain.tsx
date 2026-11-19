import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import EditorialPageView from './components/editorial/EditorialPageView';
import 'pretendard/dist/web/variable/pretendardvariable.css';
import './styles/EditorialPage.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <EditorialPageView />
  </StrictMode>,
);
