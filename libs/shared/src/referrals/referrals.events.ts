// events/user.events.ts
export const ReferralEvents = {
  REGISTERED: 'referral.registered',
  BUY: 'refferral.buy',
  BUY_SUBSCRIPTION: 'referral.buy-subscription',
  BUY_STAGE: 'refferral.buy-stage',
  BUY_PRACTISE: 'refferral.buy-practise',
  RESERVE_STAGE_BY_STAGE: 'refferral.reserve-stage-by-stage',
  RESERVE_STAGE_BY_SUBSCRIPTION: 'refferral.reserve-subscription-by-stage',
  RESERVE_BY_STAGE: 'refferral.reserve-by-stage',
  RESERVE_BY_SUBSCRIPTION: 'refferral.reserve-by-subscription',
  RESERVE_SUBSCRIPTION_BY_STAGE: 'refferral.reserve-subscription-by-stage',
  RESERVE_SUBSCRIPTION_BY_SUBSCRIPTION:
    'refferral.reserve-subscription-by-subscription',
  RESERVE_DAYS_LEFT: 'refferral.reserve-days-left',
  RESERVE_EXPIRED: 'refferral.reserve-expired',
  RESERVE_STAGE_RETURNED: 'refferral.reserve-stage-returned',
  RESERVE_SUBSCRIPTION_RETURNED: 'refferral.reserve-subscription-returned',
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
    public readonly stage: number,
    public readonly percent: number
  ) {}
}

export class ReferralBuyEvent {
  constructor(
    public readonly partnerId: number,
    public readonly referralId: number,
    public readonly level: number,
    public readonly sum: number,
    public readonly title: string,
    public readonly percent: number,
  ) {}
}

export class ReferralBuySubscriptionEvent {
  constructor(
    public readonly partnerId: number,
    public readonly referralId: number,
    public readonly level: number,
    public readonly sum: number,
    public readonly percent: number,
    public readonly days: number
  ) {}
}

export class ReferralBuyPractiseEvent {
  constructor(
    public readonly partnerId: number,
    public readonly referralId: number,
    public readonly level: number,
    public readonly sum: number,
    public readonly title: string,
    public readonly percent: number
  ) {}
}

export class ReferralReserveStageByStageEvent {
  constructor(
    public readonly partnerId: number,
    public readonly referralId: number,
    public readonly level: number,
    public readonly sum: number,
    public readonly stageLevel: number,
    public readonly stage: number
  ) {}
}

export class ReferralReserveStageBySubscriptionEvent {
  constructor(
    public readonly partnerId: number,
    public readonly referralId: number,
    public readonly level: number,
    public readonly sum: number,
    public readonly stageLevel: number,
    public readonly stage: number
  ) {}
}

export class ReferralReserveSubscriptionByStageEvent {
  constructor(
    public readonly partnerId: number,
    public readonly referralId: number,
    public readonly level: number,
    public readonly sum: number,
    public readonly days: number,
    public readonly stageLevel: number,
    public readonly stage: number
  ) {}
}

export class ReferralReserveSubscriptionBySubscriptionEvent {
  constructor(
    public readonly partnerId: number,
    public readonly referralId: number,
    public readonly level: number,
    public readonly sum: number,
    public readonly days: number
  ) {}
}

export class ReferralReserveByStageEvent {
  constructor(
    public readonly partnerId: number,
    public readonly referralId: number,
    public readonly sum: number,
    public readonly stageLevel: number,
    public readonly stage: number,
    public readonly title: string
  ) {}
}

export class ReferralReserveBySubscriptionEvent {
  constructor(
    public readonly partnerId: number,
    public readonly referralId: number,
    public readonly sum: number,
    public readonly title: string
  ) {}
}

export class ReferralReserveExpiredEvent {
  constructor(public readonly userId: number, public readonly sum: number) {}
}

export class ReferralReserveDaysLeftEvent {
  constructor(
    public readonly userId: number,
    public readonly sum: number,
    public readonly days: number
  ) {}
}

export class ReferralReserveStageReturnedEvent {
  constructor(public readonly userId: number, public readonly sum: number) {}
}

export class ReferralReserveSubscriptionReturnedEvent {
  constructor(public readonly userId: number, public readonly sum: number) {}
}
