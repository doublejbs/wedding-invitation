import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import CollagePageView from './components/collage/CollagePageView';
import 'pretendard/dist/web/variable/pretendardvariable.css';
import './styles/CollagePage.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <CollagePageView />
  </StrictMode>,
);
