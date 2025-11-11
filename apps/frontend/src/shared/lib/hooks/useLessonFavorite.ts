import { useMemo, useCallback } from 'react';
import { useAddFavoriteMutation, useGetFavoritesQuery } from '../../api/favorites.api';

export function useLessonFavorite(lessonId?: number, trainingId?: number, userId?: number) {
  const { data } = useGetFavoritesQuery({ populate: false });
  const [addFavorite, addState] = useAddFavoriteMutation();

  const isFav = useMemo(() => {
    const list = data?.data ?? [];
    if (!lessonId) return false;
    return list.some((f) => f.type === 'Lesson' && f.lessonId === lessonId);
  }, [data, lessonId]);

  const toggle = useCallback(async () => {
    if (!lessonId) return;
    if (isFav) return;
    await addFavorite({ type: 'Lesson', lessonId, trainingId, userId }).unwrap();
  }, [isFav, addFavorite, lessonId, trainingId, userId]);

  return { isFav, toggle, pending: addState.isLoading };
}