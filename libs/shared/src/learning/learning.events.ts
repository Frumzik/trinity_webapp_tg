// events/user.events.ts
export const LearningEvents = {
  TRAINING_ACCESS_STATUS_UPDATED: 'learning.training_access_status_updated',
  TRAINING_PROGRESS_STATUS_UPDATED: 'learning.training_progress_status_updated',

  LESSON_ACCESS_STATUS_UPDATED: 'learning.lesson_access_status_updated',
  LESSON_PROGRESS_STATUS_UPDATED: 'learning.lesson_progress_status_updated',
};

export class TrainingAccessStatusUpdatedEvent {
  constructor(public readonly trainingId: number, public readonly userId: number) {}
}

export class TrainingProgressStatusUpdatedEvent {
  constructor(public readonly trainingId: number, public readonly userId: number) {}
}

export class LessonAccessStatusUpdatedEvent {
  constructor(public readonly trainingId: number, public readonly userId: number) {}
}

export class LessonProgressStatusUpdatedEvent {
  constructor(public readonly trainingId: number, public readonly userId: number) {}
}
