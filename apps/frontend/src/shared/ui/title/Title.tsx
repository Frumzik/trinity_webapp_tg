import type { ReactNode } from 'react'
import './title.scss'

type TitleProps = {
    children: ReactNode
    right?: ReactNode
    className?: string
}

export default function Title({ children, right, className }: TitleProps) {
    return (
        <div className={['title', className].filter(Boolean).join(' ')}>
            <h1 className="title_everywhere">{children}</h1>
            {right ? <div className="title_right">{right}</div> : null}
        </div>
    )
}