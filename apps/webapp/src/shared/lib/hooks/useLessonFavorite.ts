import { useMemo, useState, useEffect } from "react";
import {
  useAddFavoriteMutation,
  useDeleteFavoriteMutation,
  useGetFavoritesQuery,
} from "../../api/favorites.api";

export function useLessonFavorite(lessonId?: number, trainingId?: number) {
  const { data } = useGetFavoritesQuery({ populate: true });
  const [addFav, addState] = useAddFavoriteMutation();
  const [delFav, delState] = useDeleteFavoriteMutation();
  const [localFlip, setLocalFlip] = useState<null | boolean>(null);

  // находим текущую запись избранного для этого урока
  const currentFavEntry = useMemo(() => {
    if (!lessonId) return undefined;
    const cats = data ?? [];

    for (const c of cats) {
      for (const f of c.favorites || []) {
        if (
          f.type === "Lesson" &&
          Number(f.lessonId) === Number(lessonId) &&
          (trainingId == null ||
            Number(f.trainingId) === Number(trainingId))
        ) {
          return f;
        }
      }
    }

    return undefined;
  }, [data, lessonId, trainingId]);

  const isFavServer = !!currentFavEntry;
  const isFav = localFlip === null ? isFavServer : localFlip;
  const pending = addState.isLoading || delState.isLoading;

  // если серверное состояние поменялось — сбрасываем локальный оверрайд
  useEffect(() => {
    setLocalFlip(null);
  }, [isFavServer]);

  const toggle = async () => {
    if (!lessonId || pending) return;

    const next = !isFav;
    setLocalFlip(next);

    try {
      if (next) {
        // ДОБАВЛЕНИЕ — схема как и раньше
        await addFav({
          type: "Lesson",
          lessonId,
          trainingId,
        }).unwrap();
      } else {
        // УДАЛЕНИЕ — ТОЛЬКО по favoriteId
        if (!currentFavEntry) {
          setLocalFlip(null);
          return;
        }

        await delFav({
          favoriteId: Number(currentFavEntry.favoriteId),
        }).unwrap();
      }
    } catch (e) {
      console.error("lesson favorite toggle error", e);
      setLocalFlip(null);
    }
  };

  return { isFav, toggle, pending };
}