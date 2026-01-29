import { useEffect, useMemo, useState } from "react";
import { useAddFavoriteMutation, useDeleteFavoriteMutation, useGetFavoritesQuery } from "../../api/favorites.api";
import TopActions from "../../../pages/preview/ui/TopActions";

export default function PreviewTopActions({ trainingId, onBack, onMenu }) {
  const { data: favoritesData } = useGetFavoritesQuery();

  const favoriteEntries = useMemo(
    () => (favoritesData ?? []).flatMap((cat) => cat.favorites),
    [favoritesData]
  );

  const currentFavEntry = useMemo(
    () =>
      favoriteEntries.find(
        (f) =>
          f.type === "Training" &&
          (f.trainingId === trainingId || f.favoriteId === trainingId)
      ),
    [favoriteEntries, trainingId]
  );

  const isFav = !!currentFavEntry;

  const [addFavorite] = useAddFavoriteMutation();
  const [deleteFavorite] = useDeleteFavoriteMutation();

  const [isFavLocal, setIsFavLocal] = useState(isFav);
  const [favPending, setFavPending] = useState(false);

  useEffect(() => {
    setIsFavLocal(isFav);
  }, [isFav]);

  const onToggleFav = async () => {
    if (!trainingId || favPending) return;

    setFavPending(true);
    try {
      if (currentFavEntry) {
        await deleteFavorite({ favoriteId: currentFavEntry.favoriteId }).unwrap();
      } else {
        await addFavorite({ type: "Training", trainingId }).unwrap();
      }
    } catch (e) {
      console.error("favorite toggle error", e);
    } finally {
      setFavPending(false);
    }
  };

  return (
    <TopActions
      isFav={isFavLocal}
      pending={favPending}
      onBack={onBack}
      onToggleFav={onToggleFav}
      onMenu={onMenu || (() => {})}
    />
  );
}