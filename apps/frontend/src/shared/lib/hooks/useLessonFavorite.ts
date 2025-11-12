// src/shared/lib/hooks/useLessonFavorite.ts
import { useMemo, useState } from "react";
import { useAddFavoriteMutation, useDeleteFavoriteMutation, useGetFavoritesQuery } from "../../api/favorites.api";

export function useLessonFavorite(lessonId?: number, trainingId?: number) {
  const { data } = useGetFavoritesQuery({ populate: true });
  const [addFav, addState] = useAddFavoriteMutation();
  const [delFav, delState] = useDeleteFavoriteMutation();
  const [localFlip, setLocalFlip] = useState<null | boolean>(null);

  const isFavServer = useMemo(() => {
    if (!lessonId) return false;
    const cats = data ?? [];
    for (const c of cats) {
      for (const f of c.favorites || []) {
        if (f.type === "Lesson" && Number(f.lessonId) === Number(lessonId)) return true;
      }
    }
    return false;
  }, [data, lessonId]);

  const isFav = localFlip === null ? isFavServer : localFlip;
  const pending = addState.isLoading || delState.isLoading;

  const toggle = async () => {
    if (!lessonId) return;
    const next = !isFav;
    setLocalFlip(next);
    try {
      if (next) {
        await addFav({ type: "Lesson", lessonId, trainingId }).unwrap();
      } else {
        await delFav({ type: "Lesson", lessonId, trainingId }).unwrap();
      }
    } catch {
      setLocalFlip(null);
    }
  };

  return { isFav, toggle, pending };
}