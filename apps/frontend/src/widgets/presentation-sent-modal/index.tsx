import BaseModal from '../../shared/ui/modal/BaseModal'

import FileIcon from "../../assets/icons/fileIcon.svg"

import './presentation-sent-modal.scss'

type Props = {
    open: boolean
    onClose: () => void
    fileName: string
    fileSizeText: string
    durationText?: string
}

export default function PresentationSentModal({ open, onClose, fileName, fileSizeText, durationText = '00:00' }: Props) {
    return (
        <BaseModal open={open} onClose={onClose}>
            <div className="psm">
                <div className="psm__title">Презентация<br/>загружена в чат бот</div>
                <div className="psm__file">
                    <div className="psm__fileIcon"><img src={FileIcon} alt="File"/>︎</div>
                    <div className="psm__fileMain">
                        <div className="psm__fileName">{fileName}</div>
                        <div className="psm__fileMeta">{fileSizeText}</div>
                    </div>
                    <div className="psm__fileTime">{durationText}</div>
                </div>
            </div>
        </BaseModal>
    )
}
