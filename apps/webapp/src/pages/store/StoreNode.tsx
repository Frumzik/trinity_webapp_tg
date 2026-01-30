import "./store.scss";
import { useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Title from "../../shared/ui/title/Title";
import ScrollPanel from "../../shared/ui/scroll-panel/scroll-panel";
import FeatureTile from "../../widgets/tiles/FeatureTile";
import { useGetTrainingTreeQuery } from "../../shared/api/learning.api";

function parseIds(splat) {
  if (!splat) return [];
  return splat
    .split("/")
    .filter(Boolean)
    .map((x) => Number(x))
    .filter((x) => Number.isFinite(x));
}

function findRootByKind(nodes, kind) {
  if (kind === "practices") return nodes.find((n) => !n.parentId && !n.parent && n.type === "practise");
  if (kind === "products") return nodes.find((n) => !n.parentId && !n.parent && n.type === "product");
  if (kind === "services") return nodes.find((n) => !n.parentId && !n.parent && n.type === "service");
  return nodes.find((n) => !n.parentId && !n.parent);
}

function hasChildren(n) {
  return Array.isArray(n?.childrens) && n.childrens.length > 0;
}

function walkByTrainingIds(root, ids) {
  let cur = root;
  for (const id of ids) {
    const next = (cur.childrens || []).find((c) => c.trainingId === id);
    if (!next) return null;
    cur = next;
  }
  return cur;
}

export default function StoreNode() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const kind = params.kind;
  const splat = params["*"];

  const [depth] = useState(2);
  const { data, isLoading, isError, refetch } = useGetTrainingTreeQuery({ depth });
  const roots = data?.data ?? [];

  const ids = useMemo(() => parseIds(splat), [splat]);
  const root = useMemo(() => findRootByKind(roots, kind), [roots, kind]);

  const node = useMemo(() => {
    if (!root) return null;
    return walkByTrainingIds(root, ids) || root;
  }, [root, ids]);

  const folder = hasChildren(node);

  useEffect(() => {
    if (!node) return;
    if (folder) return;

    const trainingId = node.trainingId;
    const returnTo = location.pathname;

    navigate(`/store-preview/${trainingId}?returnTo=${encodeURIComponent(returnTo)}`, { replace: true });
  }, [node, folder, navigate, location.pathname]);

  if (isLoading) return <div style={{ padding: 16 }}>Загрузка…</div>;

  if (isError)
    return (
      <div style={{ padding: 16 }}>
        Не удалось загрузить. <button onClick={() => refetch()}>Повторить</button>
      </div>
    );

  if (!root) return <div style={{ padding: 16 }}>Не найден корень для {String(kind)}</div>;
  if (!node) return <div style={{ padding: 16 }}>Узел не найден</div>;

  if (!folder) {
    return <div style={{ padding: 16 }}>Открываю страницу покупки…</div>;
  }

  return (
    <div className="supportPage">
      <Title>{node.title}</Title>

      <div className="supportPage__cards">
        <ScrollPanel maxHeight="62dvh"
                     vars={{
                       railRight: "-15px",
                       railTop: "4px",
                       railBottom: "4px",
                       railWidth: "3px",
                       railColor: "#E8E8E8",
                       thumbColor: "#C7C7C7",
                       zIndex: 20,
                     }}
        >
          {(node.childrens || []).map((ch) => {
            const to = hasChildren(ch)
              ? `/store/${kind}/${[...ids, ch.trainingId].join("/")}`
              : `/store-preview/${ch.trainingId}?returnTo=${encodeURIComponent(
                `/store/${kind}/${[...ids, ch.trainingId].join("/")}`
              )}`;

            return (
              <FeatureTile
                key={ch._id || ch.trainingId}
                title={ch.title}
                description={hasChildren(ch) ? "Открыть" : "Купить"}
                bgImageUrl={ch.coverUrl || ch.bgUrl}
                rightImageUrl={ch.iconUrl || ch.coverUrl || ch.bgUrl}
                enabled
                to={to}
                className="left-block-color"
              />
            );
          })}
        </ScrollPanel>
      </div>
    </div>
  );
}