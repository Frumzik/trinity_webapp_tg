import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';

import { store } from './app/store';
import { router } from './app/router';
import { initTelegram } from './shared/telegram/init';
import Preloader from './widgets/preloader';

initTelegram();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <Suspense fallback={< Preloader />}>
        <RouterProvider router={router} />
      </Suspense>
    </Provider>
  </StrictMode>
);