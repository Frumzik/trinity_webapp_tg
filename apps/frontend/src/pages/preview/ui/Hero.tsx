import type { ReactNode } from 'react'

type Props = {
    imageSrc: string
    title: string
    children?: ReactNode
}

export default function Hero({ imageSrc, title, children }: Props) {
    return (
        <div className="preview__hero">
            <img className="preview__img" src={imageSrc} alt="" />
            {children}
            <h1 className="preview__title">{title}</h1>
        </div>
    )
}
