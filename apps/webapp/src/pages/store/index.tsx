import "./store.scss";
import { useMemo } from "react";
import Title from "../../shared/ui/title/Title";
import ScrollPanel from "../../shared/ui/scroll-panel/scroll-panel";
import FeatureTile from "../../widgets/tiles/FeatureTile";
import { useGetTrainingTreeQuery } from "../../shared/api/learning.api";

function kindFromNode(n) {
  if (n.type === "practise") return "practices";
  if (n.type === "product") return "products";
  if (n.type === "service") return "services";
  if (n.type === "training") return "trainings";
  return "other";
}

function childrenCount(n) {
  return Array.isArray(n.childrens) ? n.childrens.length : 0;
}

export default function StoreIndex() {
  const { data, isLoading, isError, refetch } = useGetTrainingTreeQuery({ depth: 2 });
  const all = data?.data ?? [];

  const roots = useMemo(() => all.filter((n) => !n.parentId && !n.parent), [all]);

  return (
    <div className="supportPage">
      <Title>Лавка Изобилия</Title>

      {isLoading && <div style={{ padding: 16 }}>Загрузка…</div>}

      {isError && (
        <div style={{ padding: 16 }}>
          Не удалось загрузить. <button onClick={() => refetch()}>Повторить</button>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="supportPage__cards">
          <ScrollPanel maxHeight="62dvh">
            {roots.map((n) => {
              const kind = kindFromNode(n);
              return (
                <FeatureTile
                  key={n._id || n.trainingId}
                  title={n.title}
                  description={`${kind} • ${n.accessStatus} • детей: ${childrenCount(n)}`}
                  bgImageUrl={n.coverUrl || n.bgUrl}
                  rightImageUrl={n.iconUrl || n.coverUrl || n.bgUrl}
                  enabled
                  to={`/store/${kind}`}
                  className="left-block-color"
                />
              );
            })}
          </ScrollPanel>
        </div>
      )}
    </div>
  );
}