import { useState } from 'react'
import TopBar from '../../../widgets/topbarTextpage'
import GradientButton from '../../../shared/ui/gradient-button'
import TextField from '../../../shared/ui/forms/TextField'
import './reset-pin.scss'

export default function ResetPinConfirmPage(){
    const [code, setCode] = useState('')
    // const can = code.trim().length>=4

    return (
        <div className="rp">
            <TopBar title="Безопасность" />
            <main className="rp__main">
                <TextField label="Код из письма" value={code} onChange={setCode} inputMode="numeric" maxLength={6}/>
                <div className="rp__hint">Вам выслали код на почту, введите его сюда, чтобы сбросить пароль</div>
            </main>
            <div className="gbtn-bar egg">
                <div className="gbtn-bar__inner">
                    <GradientButton >Сбросить</GradientButton>
                </div>
            </div>
        </div>
    )
}