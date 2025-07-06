import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Overlay from './Overlay';
import '../index.css';

function Router() {
  const [isOverlay, setIsOverlay] = useState(window.location.hash === '#/overlay');

  useEffect(() => {
    const update = () => setIsOverlay(window.location.hash === '#/overlay');
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);

  return isOverlay ? <Overlay /> : <App />;
}

ReactDOM.createRoot(document.getElementById('root')).render(<Router />);
