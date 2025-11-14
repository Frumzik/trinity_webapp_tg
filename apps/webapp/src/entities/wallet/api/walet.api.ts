import type {
  Balance,
  DepositAddress,
  Network,
  Transaction,
  WithdrawQuote,
  Plan,
} from "../model/types.ts";

export async function getBalance(): Promise<Balance> {
  return { currency: "USD", amount: 72900 };
}

export async function getTransactions(): Promise<Transaction[]> {
  return [
    {
      id: "t1",
      createdAt: "2025-03-16T18:29:00Z",
      amount: 200,
      currency: "USD",
      title: "Реферальное вознаграждение за 1 уровень",
      type: "reward",
    },
    {
      id: "t2",
      createdAt: "2025-03-16T18:14:00Z",
      amount: 120,
      currency: "USD",
      title: "Пополнение",
      type: "deposit",
    },
    {
      id: "t3",
      createdAt: "2025-03-16T17:59:00Z",
      amount: 500,
      currency: "USD",
      title: "Пополнение",
      type: "deposit",
    },
    {
      id: "t4",
      createdAt: "2025-03-16T14:30:00Z",
      amount: 1000,
      currency: "USD",
      title: "Пополнение",
      type: "deposit",
    },
  ];
}

export async function getDepositAddress(): Promise<DepositAddress> {
  return {
    address: "0xJ3DPWEcFfHXCnBhRhgCtxowxq2r1peUH",
    network: "USDT_BEP20",
  };
}

export async function quoteWithdraw(input: number): Promise<WithdrawQuote> {
  const fee = { fixed: 0.5, percent: 5 };
  const total = Math.max(0, input + fee.fixed + input * (fee.percent / 100));
  return { input, fee, total };
}

export async function submitWithdraw(
    input: number,
    to: string,
    net: Network
): Promise<{ id: string }> {
    void input;
    void to;
    void net;

    return { id: crypto.randomUUID() };
}

export async function getPlans(): Promise<Plan[]> {
  return [
    { id: "free", title: "Бесплатно", price: 0, period: "month", active: true },
  ];
}
