// events/user.events.ts
export const SubscriptionEvents = {
  UPDATED: 'subscription.updated'
}

export class SubscriptionUpdatedEvent {
  constructor(public readonly subscirptionId: number) {}
}
