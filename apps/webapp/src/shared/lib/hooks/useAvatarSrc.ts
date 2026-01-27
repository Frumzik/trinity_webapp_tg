import { useEffect, useMemo, useState } from "react";
import { useGetUserQuery } from '../../api/user.api';
import { getTelegramUser } from '../../telegram/telegram';
import AvatarFallback from "../../../assets/icons/Ellipse 2.png";

function avatarFrom(username, name) {
  const seed = username || name || "user";
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}`;
}

export function useAvatarSrc({ avatarUrl } = {}) {
  const { data } = useGetUserQuery();
  const u = (data as any)?.data ?? (data as any);
  const tg = getTelegramUser();

  const displayName = useMemo(() => {
    if (u?.name) return u.name;
    if (tg?.first_name || tg?.last_name) {
      return [tg?.first_name, tg?.last_name].filter(Boolean).join(" ");
    }
    return "Без имени";
  }, [u, tg]);

  const displayUsername = useMemo(() => {
    return u?.username || tg?.username || "user";
  }, [u, tg]);

  const apiAvatar = u?.avatarUrl;

  const dicebear = useMemo(
    () => avatarFrom(displayUsername, displayName),
    [displayUsername, displayName]
  );

  const rawSrc = avatarUrl ?? apiAvatar ?? tg?.photo_url ?? dicebear;

  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setBroken(false);
  }, [rawSrc]);

  const src = !broken && rawSrc ? rawSrc : AvatarFallback;

  return { src, onError: () => setBroken(true), displayName, displayUsername };
}