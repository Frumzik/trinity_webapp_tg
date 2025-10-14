import { useState } from 'react'
import TopBar from '../../../widgets/topbarTextpage'
import GradientButton from '../../../shared/ui/gradient-button'
import TextField from '../../../shared/ui/forms/TextField'
import './change-pin.scss'

export default function ChangePinPage(){
    const [pin1, setPin1] = useState('')
    const [pin2, setPin2] = useState('')
    // const can = pin1.length>=4 && pin1===pin2

    return (
        <div className="sp">
            <TopBar title="Безопасность" />
            <main className="sp__main">
                <TextField label="Новый PIN-код" value={pin1} onChange={setPin1} inputMode="numeric" maxLength={6} />
                <TextField label="Повторите PIN-код" value={pin2} onChange={setPin2} inputMode="numeric" maxLength={6} />
            </main>

            <div className="gbtn-bar egg">
                <div className="gbtn-bar__inner">
                    <GradientButton  >Сохранить</GradientButton>
                </div>
            </div>
        </div>
    )
}