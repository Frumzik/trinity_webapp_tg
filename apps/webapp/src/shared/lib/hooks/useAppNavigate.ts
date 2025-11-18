import { useCallback } from 'react';
import { To, NavigateOptions, useNavigate } from 'react-router-dom';
import { useRouteLoader } from '../../ui/route-loader/RouteLoaderContext';

export function useAppNavigate() {
  const navigate = useNavigate();
  const { start, stop } = useRouteLoader();

  return useCallback(
    (to: To, options?: NavigateOptions) => {
      start();
      navigate(to, options);
      stop();
    },
    [navigate, start, stop]
  );
}