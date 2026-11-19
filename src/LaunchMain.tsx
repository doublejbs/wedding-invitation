import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import LaunchPageView from './components/launch/LaunchPageView';
import 'pretendard/dist/web/variable/pretendardvariable.css';
import './styles/LaunchPage.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <LaunchPageView />
  </StrictMode>,
);
