// events/user.events.ts
export const PurchaseEvents = {
  CREATED: 'purchase.created',
  BUY: 'purchase.buy',
  BUY_STAGE: 'purchase.buy_stage',
  BUY_PRACTISE: 'purchase.buy_practise',
  PRACTISE_DONE: 'purchase.practise_done',
  PRACTISE_ACCEPT: 'purchase.practise_accept',
  PRACTISE_ABORT: 'purchase.practise_abort',
};

export class PurchaseCreatedEvent {
  constructor(public readonly purchaseId: number) {}
}

export class PurchaseBuyEvent {
  constructor(
    public readonly userId: number,
    public readonly sum: number,
    public readonly title: string
  ) {}
}

export class PurchaseBuyStageEvent {
  constructor(
    public readonly userId: number,
    public readonly stage: number,
    public readonly stageLevel: number
  ) {}
}
export class PurchaseBuyPractiseEvent {
  constructor(
    public readonly userId: number,
    public readonly trainingId: number
  ) {}
}

export class PurchasePractiseDoneEvent {
  constructor(
    public readonly userId: number,
    public readonly trainingId: number
  ) {}
}

export class PurchasePractiseAbortEvent {
  constructor(
    public readonly userId: number,
    public readonly trainingId: number
  ) {}
}

export class PurchasePractiseAcceptEvent {
  constructor(
    public readonly userId: number,
    public readonly trainingId: number,
  ) {}
}
