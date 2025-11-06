import { Outlet } from 'react-router-dom';
import { FooterTabProvider } from './footer-tab';
import '../shared/styles/main.scss';

export default function App() {
  return (
    <FooterTabProvider>
      <Outlet />
    </FooterTabProvider>
  );
}