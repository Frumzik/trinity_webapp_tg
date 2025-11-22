// events/user.events.ts
export const AcquiringEvents = {
  DEPOSIT: 'acquiring.deposit',
  WITHDRAW: 'acquiring.withdraw',
  ERROR: 'acquiring.error',
};

export class AcquiringDepositEvent {
  constructor(public readonly userId: number, public readonly sum: number) {}
}
export class AcquiringWithdrawEvent {
  constructor(public readonly userId: number, public readonly sum: number) {}
}

export class AcquiringErrorEvent {
  constructor(public readonly message: string) {}
}
