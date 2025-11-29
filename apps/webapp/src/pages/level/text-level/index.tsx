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

type Section = {
  title?: string;
  paragraphs?: string[];
  list?: string[];
  ordered?: boolean;
  html?: string;
};

export default function LessonTextPage() {
  const navigate = useNavigate();
  const { trainingId: trainingIdStr, lessonId: lessonIdStr } =
    useParams<{ trainingId: string; lessonId: string }>();

  const trainingId = Number(trainingIdStr);
  const lessonId = Number(lessonIdStr);

  const { data, isLoading, isError, refetch } = useGetLessonAdminQuery(
    { id: lessonId, populate: true },
    { skip: !lessonId }
  );

  const { isFav, toggle, pending } = useLessonFavorite(lessonId, trainingId);

  const lesson = data?.data;
  const title = lesson?.title || "Урок";
  const subtitle =
    lesson?.duration || (lesson?.type ? String(lesson.type).toUpperCase() : undefined);
  const description = lesson?.description || "Описание";
  const imageSrc = lesson?.coverUrl || Card1;

  const html = (lesson as any)?.content?.html || "";

  const sections: Section[] = useMemo(
    () => [
      {
        title: description,
        html,
      },
    ],
    [description, html]
  );

  if (isLoading) {
    return (
      <div className="preview">
        <div style={{ padding: 16 }}>Загрузка…</div>
      </div>
    );
  }

  if (isError || !lesson) {
    return (
      <div className="preview">
        <div style={{ padding: 16 }}>
          Не удалось загрузить урок.{" "}
          <button onClick={() => refetch()}>Повторить</button>
        </div>
      </div>
    );
  }

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
          contentStyle={{ display: "contents" }}
        >
          <TextPage sections={sections} className="preview__text" />
        </ScrollPanel>
      </Sheet>
    </div>
  );
}