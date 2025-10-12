import WebApp from '@twa-dev/sdk'

export function initTelegram() {
    WebApp.ready()
    WebApp.expand()
    return {
        initData: WebApp.initData || '',
        user: WebApp.initDataUnsafe?.user || null,
        colorScheme: WebApp.colorScheme
    }
}
