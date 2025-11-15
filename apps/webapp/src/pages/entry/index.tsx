import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../app/store';
import "./entry.scss"
export default function EntryPage() {
  const token = useAppSelector((s) => s.session.token);
  const nav = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => {
      if (token) {
        nav('/home', { replace: true });
      } else {
        nav('/pin/login', { replace: true });
      }
    }, 400);

    return () => clearTimeout(t);
  }, [token, nav]);

  return (
    <div className="entry-screen" />
  );
}