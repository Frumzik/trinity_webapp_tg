/* eslint-disable @typescript-eslint/no-explicit-any */
const API_URL = import.meta.env.VITE_API_URL;

export const authProvider = {
  // 🔐 Логин
  login: async ({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'EMAIL', email: username, password }),
    });

    if (!res.ok) {
      throw new Error('Неверный логин или пароль');
    }

    const data = await res.json();

    // допустим backend возвращает { token: "...", refresh: "..." }
    localStorage.setItem('token', data.data.access_token);

    return Promise.resolve();
  },

  // 🔓 Проверка авторизации
  checkAuth: () => {
    return localStorage.getItem('token') ? Promise.resolve() : Promise.reject();
  },

  // 🔒 Выход
  logout: () => {
    localStorage.removeItem('token');
    return Promise.resolve();
  },

  // 👀 Проверка прав (можно расширить)
  getPermissions: () => Promise.resolve(),

  // 🔁 Обработка ошибок API (например 401)
  checkError: (error: any) => {
    if (error.status === 401 || error.status === 403) {
      localStorage.removeItem('token');
      return Promise.reject();
    }
    return Promise.resolve();
  },
};
