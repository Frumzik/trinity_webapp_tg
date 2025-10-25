// events/user.events.ts
export const ContentEvents = {
  TRAINING_CREATED: 'content.training_created',
  TRAINING_UPDATED: 'content.training_updated',
  TRAINING_DELETED: 'content.training_deleted',
  TRAINING_ACCESS_RULES_UPDATED: 'content.training_access_rules_updated',

  LESSON_CREATED: 'content.lesson_created',
  LESSON_UPDATED: 'content.lesson_updated',
  LESSON_DELETED: 'content.lesson_deleted',
  LESSON_ACCESS_RULES_UPDATED: 'content.lesson_access_rules_updated',

}

export class TrainingCreatedEvent {
  constructor(public readonly trainingId: number) {}
}

export class TrainingUpdatedEvent {
  constructor(public readonly trainingId: number) {}
}
export class TrainingDeletedEvent {
  constructor(public readonly trainingId: number) {}
}

export class TrainingAccessRulesUpdatedEvent {
  constructor(public readonly trainingId: number) {}
}


export class LessonCreatedEvent {
  constructor(public readonly lessonId: number) {}
}

export class LessonUpdatedEvent {
  constructor(public readonly lessonId: number) {}
}
export class LessonDeletedEvent {
  constructor(public readonly lessonId: number) {}
}

export class LessonAccessRulesUpdatedEvent {
  constructor(public readonly lessonId: number) {}
}
