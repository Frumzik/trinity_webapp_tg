// events/user.events.ts
export const UserEvents = {
  REGISTERED: 'user.registered',
  LOGGED_IN: 'user.logged_id',
  UPDATED: 'user.updated'
}

export class UserRegisteredEvent {
  constructor(public readonly userId: number) {}
}

export class UserLoggedInEvent {
  constructor(public readonly userId: number) {}
}
