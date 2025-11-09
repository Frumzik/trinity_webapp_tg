import { useEffect } from 'react';
import { useGetUserQuery, useUpdateProfileMutation } from '../../../shared/api/user.api';

export function useSyncTelegramAvatar() {
  const { data: userRes } = useGetUserQuery();
  const [updateProfile] = useUpdateProfileMutation();

  useEffect(() => {
    const tg = (window as any)?.Telegram?.WebApp;
    const photoUrl: string | undefined = tg?.initDataUnsafe?.user?.photo_url;

    const user = userRes?.data;
    const hasAvatar = !!user?.avatarUrl;
    const alreadySynced = localStorage.getItem('avatarSynced') === '1';

    if (!photoUrl) return;
    if (alreadySynced) return;
    if (hasAvatar && user!.avatarUrl === photoUrl) {
      localStorage.setItem('avatarSynced', '1');
      return;
    }

    updateProfile({ avatarUrl: photoUrl })
      .unwrap()
      .then(() => localStorage.setItem('avatarSynced', '1'))
      .catch(() => {
        // можно залогировать, но не спамить пользователя
      });
  }, [userRes, updateProfile]);
}