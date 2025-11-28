// src/shared/ui/TextPage/index.tsx
import clsx from "clsx";
import styles from "./text-page.module.scss";

type Section = {
  title?: string;        // h1
  paragraphs?: string[];
  list?: string[];
  ordered?: boolean;
  html?: string;         // сырое HTML из админки
};

type TextPageProps = {
  sections: Section[];
  className?: string;
};

export default function TextPage({ sections, className }: TextPageProps) {
  return (
    <div className={clsx(styles.wrap, className)}>
      <main className={styles.content}>
        {sections.map((s, i) => (
          <section key={i} className={styles.section}>

            {s.html && (
              <div
                className={styles.html}
                dangerouslySetInnerHTML={{ __html: s.html }}
              />
            )}

            {s.paragraphs?.map((p, j) => (
              <p key={j} className={styles.p}>
                {p}
              </p>
            ))}

            {!!s.list?.length &&
              (s.ordered ? (
                <ol className={styles.list}>
                  {s.list.map((li, k) => (
                    <li key={k}>{li}</li>
                  ))}
                </ol>
              ) : (
                <ul className={styles.list}>
                  {s.list.map((li, k) => (
                    <li key={k}>{li}</li>
                  ))}
                </ul>
              ))}
          </section>
        ))}
      </main>
    </div>
  );
}