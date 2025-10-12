import clsx from 'clsx'
import styles from './text-page.module.scss'

type Section = {
    title?: string
    paragraphs?: string[]
    list?: string[]
    ordered?: boolean
}

type TextPageProps = {
    sections: Section[]
    className?: string
}

export default function TextPage({  sections, className }: TextPageProps) {
    return (
        <div className={clsx(styles.wrap, className)}>
            <main className={styles.content}>
                {sections.map((s, i) => (
                    <section key={i} className={styles.section}>
                        {s.title && <h2 className={styles.h2}>{s.title}</h2>}
                        {s.paragraphs?.map((p, j) => <p key={j} className={styles.p}>{p}</p>)}
                        {!!s.list?.length && (s.ordered ? (
                            <ol className={styles.list}>
                                {s.list.map((li, k) => <li key={k}>{li}</li>)}
                            </ol>
                        ) : (
                            <ul className={styles.list}>
                                {s.list.map((li, k) => <li key={k}>{li}</li>)}
                            </ul>
                        ))}
                    </section>
                ))}
            </main>
        </div>
    )
}
