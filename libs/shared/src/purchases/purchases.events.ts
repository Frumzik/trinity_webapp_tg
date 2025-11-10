// events/user.events.ts
export const PurchaseEvents = {
  CREATED: 'purchase.CREATED',
}

export class PurchaseCreatedEvent {
  constructor(public readonly purchaseId: number) {}
}
