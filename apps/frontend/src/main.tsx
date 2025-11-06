import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { store } from './app/store';
import { router } from './app/router';
import { initTelegram } from './shared/telegram/init';

function Bootstrap() {
  useEffect(() => {
    if ((window as any).Telegram?.WebApp) initTelegram();
  }, []);
  return <RouterProvider router={router} />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <Bootstrap />
    </Provider>
  </StrictMode>
);