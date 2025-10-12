
import TextRenderer from '../../../shared/ui/TextPage/index.tsx'

type Props = {
    title: string
    text: string | undefined
}

export default function Description({ title, text }: Props) {
    const blocks = (text ?? '').trim().split(/\n{2,}/g)
    return (
        <div className="preview__text">
            <p><strong>{title}</strong></p>
            <TextRenderer {...({ value: blocks } as any)} />
        </div>
    )
}
