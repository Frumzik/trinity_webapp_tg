// events/user.events.ts
export const SubscriptionEvents = {
  UPDATED: 'subscription.updated',
  PAYED: 'subscription.payed',
  DAYS_LEFT: 'subscription.days_left',
  EXPIRED: 'subscription.expired',
};

export class SubscriptionUpdatedEvent {
  constructor(public readonly subscriptionId: number) {}
}

export class SubscriptionPayedEvent {
  constructor(public readonly subscriptionId: number) {}
}

export class SubscriptionDaysLeftEvent {
  constructor(
    public readonly subscriptionId: number,
    public readonly days: number
  ) {}
}

export class SubscriptionExpiredEvent {
  constructor(public readonly subscriptionId: number) {}
}
