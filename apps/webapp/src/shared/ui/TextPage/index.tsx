import clsx from "clsx";
import styles from "./text-page.module.scss";

type Section = {
  title?: string;
  paragraphs?: string[];
  list?: string[];
  ordered?: boolean;
  html?: string;
};

type TextPageProps = {
  sections: Section[];
  className?: string;
};

const withParagraphSpacing = (html: string) => {
  if (!html) return html;

  return html
    // <p>
    .replace(
      /<p>(?![^]*?style=)/gi,
      '<p style="margin: 0 0 12px 0; line-height: 150%;">'
    )
    // <p >
    .replace(
      /<p\s*>(?![^]*?style=)/gi,
      '<p style="margin: 0 0 12px 0; line-height: 150%;">'
    );
};

export default function TextPage({ sections, className }: TextPageProps) {
  return (
    <div className={clsx(styles.wrap, className)}>
      <main className={styles.content}>
        {sections.map((s, i) => (
          <section key={i} className={styles.section}>
            {s.html &&
              (s.html.includes("<") ? (
                <div
                  className={styles.html}
                  dangerouslySetInnerHTML={{
                    __html: withParagraphSpacing(s.html),
                  }}
                />
              ) : (
                <p className={styles.p}>{s.html}</p>
              ))}

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