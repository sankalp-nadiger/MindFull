import { useEffect } from 'react';

const ResourcePreloader = () => {
  useEffect(() => {
    // Preload critical images
    const criticalImages = [
      '/plant.png',
      '/music.jpg',
      '/18.png',
      '/41.png',
      '/55.png',
      '/56.png',
      '/65.png'
    ];

    criticalImages.forEach((src) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });

    // Preload critical CSS
    const criticalCSS = document.createElement('link');
    criticalCSS.rel = 'preload';
    criticalCSS.as = 'style';
    criticalCSS.href = '/src/index.css';
    document.head.appendChild(criticalCSS);

    // DNS prefetch for external resources
    const dnsPrefetch = [
      'https://fonts.googleapis.com',
      'https://cdn.jsdelivr.net',
      'https://unpkg.com'
    ];

    dnsPrefetch.forEach((domain) => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      document.head.appendChild(link);
    });

  }, []);

  return null;
};

export default ResourcePreloader;
