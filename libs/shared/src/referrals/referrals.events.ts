// events/user.events.ts
export const RefferalEvents = {
  REGISTERED: 'referral.registered',
  BUY_STAGE: 'refferral.buy-stage',
  BUY: 'refferral.buy',
  RESERVE: 'refferral.reserve',
};

export class ReferralRegisteredEvent {
  constructor(
    public readonly partnerId: number,
    public readonly referralId: number,
    public readonly level: number
  ) {}
}

export class ReferralBuyStageEvent {
  constructor(
    public readonly partnerId: number,
    public readonly referralId: number,
    public readonly level: number,
    public readonly sum: number,
    public readonly stageLevel: number,
    public readonly stage: number
  ) {}
}

export class ReferralBuyEvent {
  constructor(
    public readonly partnerId: number,
    public readonly referralId: number,
    public readonly level: number,
    public readonly sum: number,
    public readonly title: string
  ) {}
}

export class ReferralReserveEvent {
  constructor(
    public readonly partnerId: number,
    public readonly referralId: number,
    public readonly level: number,
    public readonly sum: number,
    public readonly stageLevel: number,
    public readonly stage: number
  ) {}
}
