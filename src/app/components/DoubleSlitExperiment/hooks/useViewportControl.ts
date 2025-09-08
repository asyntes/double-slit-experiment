import { useEffect } from 'react';

export const useViewportControl = () => {
  useEffect(() => {
    // Ensure proper viewport behavior on mount and orientation changes
    const setViewport = () => {
      let viewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
      
      if (!viewport) {
        viewport = document.createElement('meta');
        viewport.name = 'viewport';
        document.head.appendChild(viewport);
      }
      
      viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no';
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setViewport();
      }
    };

    const handleOrientationChange = () => {
      // Small delay to ensure orientation change is complete
      setTimeout(setViewport, 150);
    };

    // Set initial viewport
    setViewport();

    // Listen for page visibility changes (when coming from external sites)
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Listen for orientation changes
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // Also listen to resize as fallback
    window.addEventListener('resize', handleOrientationChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);
};