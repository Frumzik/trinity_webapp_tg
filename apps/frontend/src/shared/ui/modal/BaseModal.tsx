import {type ReactNode, useEffect} from 'react'

import './base-modal.scss'

type Props = {
    open: boolean
    onClose: () => void
    children: ReactNode
}

export default function BaseModal({open, onClose, children}: Props) {
    useEffect(() => {
        document.documentElement.style.overflow = open ? 'hidden' : ''
        return () => {
            document.documentElement.style.overflow = ''
        }
    }, [open])

    if (!open) return null

    return (
        <div className="modal" role="dialog" aria-modal="true" onClick={onClose}>
            <div className="modal__box" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="modal__close" aria-label="Закрыть" onClick={onClose}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="22"
                        height="22"
                        viewBox="0 0 22 22"
                        fill="none"
                    >
                        <foreignObject x={-4.00433} y={-4.16058} width={30.1649} height={30.1639}>
                            <div


                                style={{
                                    backdropFilter: 'blur(2.08px)',
                                    clipPath: 'url(#bgblur_0_476_6944_clip_path)',
                                    height: '100%',
                                    width: '100%',
                                }}
                            />
                        </foreignObject>

                        <g filter="url(#filter0_i_476_6944)" data-figma-bg-blur-radius="4.16058">

                            <circle cx={11.0778} cy={10.9215} r={10.9215} fill="currentColor" fillOpacity={0.4}/>
                        </g>

                        <path d="M8.47656 8.32129L13.6773 13.522" stroke="#fff" strokeWidth={2.08029}/>
                        <path d="M13.6777 8.32129L8.477 13.522" stroke="#fff" strokeWidth={2.08029}/>

                        <defs>
                            <filter
                                id="filter0_i_476_6944"
                                x={-4.00433}
                                y={-4.16058}
                                width={30.1649}
                                height={30.1639}
                                filterUnits="userSpaceOnUse"
                                colorInterpolationFilters="sRGB"
                            >
                                <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                                <feColorMatrix
                                    in="SourceAlpha"
                                    type="matrix"
                                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                    result="hardAlpha"
                                />
                                <feOffset/>
                                <feGaussianBlur stdDeviation="3.31691"/>
                                <feComposite in2="hardAlpha" operator="arithmetic" k2={-1} k3={1}/>
                                <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"/>
                                <feBlend mode="normal" in2="shape" result="effect1_innerShadow_476_6944"/>
                            </filter>

                            <clipPath id="bgblur_0_476_6944_clip_path" transform="translate(4.00433 4.16058)">
                                <circle cx={11.0778} cy={10.9215} r={10.9215}/>
                            </clipPath>
                        </defs>
                    </svg>
                </button>
                {children}
            </div>
        </div>
    )
}
