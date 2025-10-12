type Props = { value: string }
export default function Price({ value }: Props) {
    return <p className="preview__price">Стоимость: <b>{value}</b></p>
}
