export type Fiat = 'USD' | 'OM'
export type Network = 'USDT_BEP20'

export type Balance = {
    currency: Fiat
    amount: number
}

export type Transaction = {
    id: string
    createdAt: string
    amount: number
    currency: Fiat
    title: string
    type: 'deposit' | 'withdraw' | 'reward'
}

export type DepositAddress = {
    address: string
    network: Network
}

export type Fee = {
    fixed: number
    percent: number
}

export type WithdrawQuote = {
    input: number
    fee: Fee
    total: number
}

export type Plan = {
    id: string
    title: string
    price: number
    period: 'month' | 'year'
    active: boolean
}