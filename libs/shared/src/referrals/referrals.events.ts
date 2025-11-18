// events/user.events.ts
export const RefferalEvents = {
  REGISTERED: 'referral.registered',
}

export class ReferralRegisteredEvent {
  constructor(public readonly partnerId: number, public readonly referralId: number, public readonly level: number) {}
}
