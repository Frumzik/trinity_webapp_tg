type TgUser = { id: number; username?: string; first_name?: string; last_name?: string; language_code?: string; photo_url?: string; };

function parseQuery(): Partial<TgUser> {
  const q = new URLSearchParams(location.search);
  const id = q.get('tgId') || q.get('id');
  return {
    id: id ? Number(id) : NaN,
    username: q.get('username') || undefined,
    first_name: q.get('first_name') || undefined,
    last_name: q.get('last_name') || undefined,
    language_code: q.get('lang') || undefined,
    photo_url: q.get('photo') || undefined,
  };
}
function loadSavedUser(): TgUser | null {
  try { const raw = localStorage.getItem('__tg_user'); return raw ? JSON.parse(raw) as TgUser : null; } catch { return null; }
}
function saveUser(u: TgUser) { localStorage.setItem('__tg_user', JSON.stringify(u)); }

export function bootstrapDevTelegram() {
  const isLocal = location.hostname === 'localhost' || new URLSearchParams(location.search).get('dev') === '1';

  if (!isLocal) return;

  const real = (window as any).Telegram?.WebApp;
  const hasRealUser = !!real?.initDataUnsafe?.user;

  const fromQuery = parseQuery();
  const user: TgUser | null = Number.isFinite(fromQuery.id!) ? (fromQuery as TgUser) : loadSavedUser();
  if (!user) {
    console.log('[dev-tg] добавь к URL ?tgId=123&username=dev (или один раз и сохранится)');
    return;
  }
  saveUser(user);

  if (!hasRealUser) {
    (window as any).Telegram = {
      WebApp: {
        initData: '',
        initDataUnsafe: { user },
        colorScheme: 'light',
        ready() {},
        expand() {},
        sendData(_: string) {},
      },
    };
    console.log('[dev-tg] mock Telegram.WebApp установлен:', user);
  }
}