import { useState } from 'react'
import TopBar from '../../../widgets/topbarTextpage'
import GradientButton from '../../../shared/ui/gradient-button'
import TextField from '../../../shared/ui/forms/TextField'
import '../reset-pin-confirm/reset-pin.scss'

export default function ResetPinRequestPage(){
    const [email, setEmail] = useState('')
    // const can = /\S+@\S+\.\S+/.test(email)

    return (
        <div className="rp">
            <TopBar title="Безопасность" />
            <main className="rp__main">
                <TextField label="Сбросить PIN-код" value={email} onChange={setEmail} type="email" placeholder="email@example.com"/>
            </main>

            <div className="gbtn-bar egg">
                <div className="gbtn-bar__inner ">
                    <GradientButton  onClick={()=>location.assign('/security/reset-pin-confirm')}>
                        Запросить код
                    </GradientButton>
                </div>
            </div>
        </div>
    )
}