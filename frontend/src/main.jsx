import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './critical.css'
import './index.css'
import App from './App.jsx'
import ResourcePreloader from './components/ResourcePreloader/ResourcePreloader.jsx'
import PerformanceMonitor from './components/PerformanceMonitor/PerformanceMonitor.jsx'

// Register service worker for caching
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PerformanceMonitor />
    <ResourcePreloader />
    <App />
  </StrictMode>,
)
