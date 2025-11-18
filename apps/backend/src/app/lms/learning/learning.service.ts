import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UserEntity, UsersService } from '../../account';
import { ContentService } from '../content';
import { LearningsRepository } from './repositories';
import { LearningEntity } from './entities';
import { FilterQuery, Types } from 'mongoose';
import {
  ContentAccessType,
  ILearningLesson,
  LearningAccessStatus,
  LearningEvents,
  LearningProgressStatus,
  LessonProgressStatusUpdatedEvent,
  PurchaseType,
  TrainingProgressStatusUpdatedEvent,
} from '@trinity/shared';
import { PurchaseService, SubscriptionsService } from '../../billing';
import { LessonEntity, TrainingEntity } from '../content/entities';
import { Learning } from './models';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class LearningService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => ContentService))
    private readonly contentService: ContentService,
    @Inject(forwardRef(() => SubscriptionsService))
    private readonly subscriptionsService: SubscriptionsService,
    private readonly learningRepository: LearningsRepository,
    @Inject(forwardRef(() => PurchaseService))
    private readonly purchaseService: PurchaseService,
    private readonly eventEmitter: EventEmitter2
  ) {}
  async find(condition: FilterQuery<Learning>): Promise<LearningEntity | null> {
    try {
      const learning = await this.learningRepository.find(condition);

      return learning;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при поиске прогресса';
      throw new InternalServerErrorException(message);
    }
  }

  async findAll(condition: FilterQuery<Learning>): Promise<LearningEntity[]> {
    try {
      const learning = await this.learningRepository.findAll(condition);

      return learning;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при поиске прогресса';
      throw new InternalServerErrorException(message);
    }
  }

  async calculateAccess(
    user: UserEntity,
    content: TrainingEntity | LessonEntity
  ) {
    try {
      const { accessRules } = content;

      if (!accessRules || accessRules.length === 0) {
        // Если нет ограничений — доступ открыт
        return LearningAccessStatus.AVAILABLE;
      }

      const subscription = await this.subscriptionsService.find({
        userId: user.userId,
      });

      if (!subscription) {
        throw new Error('Не найдена подписка для пользователя');
      }

      // Пробегаем по каждому условию
      for (const rule of accessRules) {
        switch (rule.type) {
          case ContentAccessType.FREE:
            // Бесплатный контент всегда доступен
            break;

          case ContentAccessType.SUBSCRIPTION:
            if (!subscription.isActive()) {
              return LearningAccessStatus.LOCKED;
            }
            break;

          case ContentAccessType.ONE_TIME_PAYMENT: {
            const purchaseQuery =
              content instanceof TrainingEntity
                ? {
                    type: PurchaseType.TRAINING,
                    userId: user.userId,
                    contentId: content.trainingId,
                  }
                : {
                    type: PurchaseType.LESSON,
                    userId: user.userId,
                    contentId: content.lessonId,
                  };

            if (!(await this.purchaseService.find(purchaseQuery))) {
              return LearningAccessStatus.LOCKED;
            }
            break;
          }

          case ContentAccessType.DATE_UNLOCK:
            if (rule.value && new Date() < new Date(rule.value)) {
              return LearningAccessStatus.LOCKED;
            }
            break;

          case ContentAccessType.TRAINING_COMPLETED: {
            const training = await this.find({
              userId: user.userId,
              trainingId: rule.value,
            });

            if (training?.progressStatus !== LearningProgressStatus.COMPLETED) {
              return LearningAccessStatus.LOCKED;
            }

            break;
          }

          case ContentAccessType.LESSON_COMPLETED: {
            const lesson = await this.contentService.findLesson({
              lessonId: rule.value,
            });

            const training = await this.find({
              userId: user.userId,
              trainingId: lesson?.parentId,
            });

            if (
              training?.lessons.find((el) => el.lessonId == rule.value)
                ?.progressStatus !== LearningProgressStatus.COMPLETED
            ) {
              return LearningAccessStatus.LOCKED;
            }
            break;
          }
          default:
            return LearningAccessStatus.LOCKED;
        }
      }

      // Если дошли сюда — все условия выполнены
      return LearningAccessStatus.AVAILABLE;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Ошибка';
      throw new InternalServerErrorException(message);
    }
  }

  async recalculateTrainingForUser(training: TrainingEntity, user: UserEntity) {
    try {
      // 1️⃣ Получаем существующий прогресс
      const learning = await this.learningRepository.find({
        user: user.userId,
        training: training.trainingId,
      });

      // --- Вычисляем доступ для родительского тренинга ---
      const trainingAccessStatus = await this.calculateAccess(user, training);

      // 2️⃣ Если прогресса нет — создаём
      if (!learning) {
        const lessons: ILearningLesson[] = [];

        // Если сам тренинг недоступен — все уроки тоже недоступны
        const globalAccess =
          trainingAccessStatus === LearningAccessStatus.LOCKED
            ? LearningAccessStatus.LOCKED
            : undefined;

        for (const id of training.lessons) {
          const lesson = await this.contentService.findLesson({ _id: id });
          if (!lesson) continue;

          const accessStatus =
            globalAccess ?? (await this.calculateAccess(user, lesson));

          lessons.push({
            lesson: id,
            lessonId: lesson.lessonId,
            accessStatus,
            progressStatus: LearningProgressStatus.NOT_STARTED,
          });
        }

        const newLearning = new LearningEntity({
          user: user._id as Types.ObjectId,
          training: training._id as Types.ObjectId,
          userId: user.userId,
          trainingId: training.trainingId,
          lessons,
          accessStatus: trainingAccessStatus,
          progressStatus: LearningProgressStatus.NOT_STARTED,
        });

        return await this.learningRepository.create(newLearning);
      }

      // 3️⃣ Прогресс уже есть — синхронизируем уроки
      const trainingLessonIds = training.lessonsId;
      const filteredLessons = learning.lessons.filter((l) =>
        trainingLessonIds.includes(l.lessonId)
      );

      for (const lessonId of trainingLessonIds) {
        const exists = filteredLessons.some((l) => l.lessonId === lessonId);
        if (!exists) {
          const lessonEntity = await this.contentService.findLesson({
            lessonId,
          });
          if (!lessonEntity) continue;

          const accessStatus =
            trainingAccessStatus === LearningAccessStatus.LOCKED
              ? LearningAccessStatus.LOCKED
              : await this.calculateAccess(user, lessonEntity);

          filteredLessons.push({
            lesson: lessonEntity._id as Types.ObjectId,
            lessonId: lessonEntity.lessonId,
            accessStatus,
            progressStatus: LearningProgressStatus.NOT_STARTED,
          });
        }
      }

      // 4️⃣ Обновляем статусы доступа у всех актуальных уроков
      for (const lesson of filteredLessons) {
        const lessonEntity = await this.contentService.findLesson({
          lessonId: lesson.lessonId,
        });
        if (!lessonEntity) continue;

        lesson.accessStatus =
          trainingAccessStatus === LearningAccessStatus.LOCKED
            ? LearningAccessStatus.LOCKED
            : await this.calculateAccess(user, lessonEntity);
      }

      // 5️⃣ Рассчитываем общий статус тренинга по дочерним элементам
      const lessonStatuses = filteredLessons.map((l) => l.progressStatus);

      const hasInProgress = lessonStatuses.includes(
        LearningProgressStatus.IN_PROGRESS
      );
      const hasCompleted = lessonStatuses.includes(
        LearningProgressStatus.COMPLETED
      );
      const allCompleted =
        lessonStatuses.length > 0 &&
        lessonStatuses.every((s) => s === LearningProgressStatus.COMPLETED);

      let newProgressStatus = LearningProgressStatus.NOT_STARTED;
      if (hasInProgress || (hasCompleted && !allCompleted)) {
        newProgressStatus = LearningProgressStatus.IN_PROGRESS;
      } else if (allCompleted) {
        newProgressStatus = LearningProgressStatus.COMPLETED;
      }

      // 6️⃣ Обновляем объект обучения
      learning.lessons = filteredLessons;
      learning.accessStatus = trainingAccessStatus;
      learning.progressStatus = newProgressStatus;

      const updated = await this.learningRepository.update(learning);
      return updated;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка пересчёта прогресса';
      throw new InternalServerErrorException(message);
    }
  }

  async recalculateForUser(userId: number) {
    try {
      const user = await this.usersService.find({ userId });

      if (!user) {
        // 🧹 Если пользователь удалён — чистим все его прогрессы
        await this.learningRepository.delete({ userId });
        throw new NotFoundException('Пользователь не найден');
      }

      const trainings = await this.contentService.findAllTrainings();

      for (const training of trainings) {
        await this.recalculateTrainingForUser(training, user);
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при расчёте доступа';
      throw new InternalServerErrorException(message);
    }
  }

  async recalculateForTraining(trainingId: number) {
    try {
      const training = await this.contentService.findTraining({ trainingId });

      if (!training) {
        // 🧹 Если тренинг удалён — удаляем весь прогресс по нему
        await this.learningRepository.delete({ trainingId });
        return;
      }

      const users = await this.usersService.findAll();

      for (const user of users) {
        await this.recalculateTrainingForUser(training, user);
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при расчёте доступа';
      throw new InternalServerErrorException(message);
    }
  }

  async recalculateAll() {
    try {
      const trainings = await this.contentService.findAllTrainings();
      const users = await this.usersService.findAll();
      const learnings = await this.learningRepository.findAll();

      const validTrainingIds = new Set<number>(
        trainings.map((t) => t.trainingId)
      );
      const validUserIds = new Set<number>(users.map((u) => u.userId));

      // --- 1️⃣ Удаляем записи, где нет соответствующего пользователя или тренинга ---
      for (const learning of learnings) {
        if (
          !validUserIds.has(learning.userId) ||
          !validTrainingIds.has(learning.trainingId)
        ) {
          await this.learningRepository.delete({
            userId: learning.userId,
            trainingId: learning.trainingId,
          });
        }
      }

      // --- 2️⃣ Создаём или обновляем корректные записи ---
      for (const user of users) {
        for (const training of trainings) {
          await this.recalculateTrainingForUser(training, user);
        }
      }

      return true;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Ошибка при расчёте доступа';
      throw new InternalServerErrorException(message);
    }
  }

  async updateTrainingProgress(
    userId: number,
    trainingId: number,
    progress: LearningProgressStatus
  ) {
    try {
      const learning = await this.learningRepository.find({
        userId,
        trainingId,
      });

      if (!learning) {
        throw new NotFoundException('Прогресс не найден');
      }

      const updated = await this.learningRepository.update(
        learning.updateProgressStatus(progress)
      );

      this.eventEmitter.emit(
        LearningEvents.TRAINING_PROGRESS_STATUS_UPDATED,
        new TrainingProgressStatusUpdatedEvent(updated.trainingId, userId)
      );

      return updated;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Ошибка';
      throw new InternalServerErrorException(message);
    }
  }

  async updateLessonProgress(
    userId: number,
    lessonId: number,
    progress: LearningProgressStatus
  ) {
    try {
      const lesson = await this.contentService.findLesson({ lessonId });
      if (!lesson) {
        throw new NotFoundException('Урок не найден');
      }

      const learning = await this.learningRepository.find({
        userId,
        trainingId: lesson.parentId,
      });

      if (!learning) {
        throw new NotFoundException('Прогресс не найден');
      }

      const updated = await this.learningRepository.update(
        learning.updateLessonProgressStatus(lessonId, progress)
      );

      this.eventEmitter.emit(
        LearningEvents.LESSON_PROGRESS_STATUS_UPDATED,
        new LessonProgressStatusUpdatedEvent(
          lesson.parentId as number,
          lesson.lessonId,
          userId
        )
      );

      return updated;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Ошибка';
      throw new InternalServerErrorException(message);
    }
  }

  async delete(options: { trainingId?: number; userId?: number }) {
    return await this.learningRepository.delete(options);
  }

  async getLearningTree(condition?: FilterQuery<Learning>) {
    if (condition?.trainingId) {
      const training = await this.contentService.findTraining({
        trainingId: condition.trainingId,
      });

      if (!training) {
        throw new NotFoundException('Тренинг не найден');
      }
    }
    return await this.learningRepository.getLearningTree(condition);
  }

  async getCurrentStage(userId: number) {
    return await this.learningRepository.getCurrentStage(userId);
  }
}
