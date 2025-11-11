import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ScrollPanel from "../../../shared/ui/scroll-panel/scroll-panel";
import Hero from "../../preview/ui/Hero";
import TopActions from "../../preview/ui/TopActions";
import Sheet from "../../preview/ui/Sheet";
import TextPage from "../../../shared/ui/TextPage";
import Card1 from "../../../assets/image/bg.svg";
import "./lesson-text.scss";

import { useGetLessonAdminQuery } from "../../../shared/api/contentAdmin.api";
import { smartBack } from "../../../shared/navigation/smartBack";
import { useLessonFavorite } from "../../../shared/lib/hooks/useLessonFavorite";

function htmlToParagraphs(html?: string | null): string[] {
  if (!html) return [];
  let txt = html
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<[^>]+>/g, "");
  txt = txt
    .split("\n")
    .map((s) => s.trim())
    .join("\n");
  return txt.split(/\n{2,}/g).map((p) => p.trim()).filter(Boolean);
}

type Section = { title: string; paragraphs: string[] };

export default function LessonTextPage() {
  const navigate = useNavigate();

  // ХУКИ ВСЕГДА СВЕРХУ!
  const { trainingId: trainingIdStr, lessonId: lessonIdStr } = useParams<{ trainingId: string; lessonId: string }>();
  const trainingId = Number(trainingIdStr);
  const lessonId = Number(lessonIdStr);

  // контент урока
  const { data, isLoading, isError, refetch } = useGetLessonAdminQuery(
    { id: lessonId, populate: true },
    { skip: !lessonId }
  );

  // избранное
  const { isFav, toggle, pending } = useLessonFavorite(lessonId, trainingId);

  if (isLoading) {
    return (
      <div className="preview">
        <div style={{ padding: 16 }}>Загрузка…</div>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="preview">
        <div style={{ padding: 16 }}>
          Не удалось загрузить урок. <button onClick={() => refetch()}>Повторить</button>
        </div>
      </div>
    );
  }

  const lesson = data.data;
  const imageSrc = lesson.coverUrl || Card1;
  const title = lesson.title || "Урок";
  const subtitle = lesson.duration || (lesson.type ? String(lesson.type).toUpperCase() : undefined);
  const description = lesson.description || "Описание";

  const sections: Section[] = useMemo(() => {
    const paragraphs = htmlToParagraphs((lesson as any)?.content?.html);
    return [
      {
        title: description,
        paragraphs: paragraphs.length ? paragraphs : ["Контент появится позже."],
      },
    ];
  }, [lesson, description]);

  return (
    <div className="preview">
      <Hero imageSrc={imageSrc} title={title} subtitle={subtitle}>
        <TopActions
          isFav={isFav}
          onBack={() => smartBack(navigate, `/level/${trainingId}`)}
          onToggleFav={() => !pending && toggle()}
          onMenu={() => {}}
        />
      </Hero>

      <Sheet head={description}>
        <ScrollPanel
          maxHeight="43dvh"
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
          <TextPage sections={sections} className="preview__text" />
        </ScrollPanel>
      </Sheet>
    </div>
  );
}