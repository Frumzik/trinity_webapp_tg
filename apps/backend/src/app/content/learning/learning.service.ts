import {
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
  LearningProgressStatus,
  SubscriptionPurchaseType,
} from '@trinity/shared';
import { SubscriptionsService } from '../../billing';
import { LessonEntity, TrainingEntity } from '../content/entities';
import { Learning } from './models';

@Injectable()
export class LearningService {
  constructor(
    private readonly usersService: UsersService,
    private readonly contentService: ContentService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly learningRepository: LearningsRepository
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
            const subscriptionPurchase =
              content instanceof TrainingEntity
                ? {
                    type: SubscriptionPurchaseType.TRAINING,
                    contentId: content.trainingId,
                  }
                : {
                    type: SubscriptionPurchaseType.LESSON,
                    contentId: content.lessonId,
                  };

            if (!subscription.hasPurchase(subscriptionPurchase)) {
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
      let learning = await this.learningRepository.find({
        user: user._id,
        training: training._id,
      });

      if (!learning) {
        const lessons: ILearningLesson[] = [];

        for (const id of training.lessons) {
          const lesson = await this.contentService.findLesson({ _id: id });

          if (!lesson) return;

          lessons.push({
            lesson: id,
            lessonId: lesson.lessonId,
            accessStatus: await this.calculateAccess(user, lesson),
            progressStatus: LearningProgressStatus.NOT_STARTED,
          });
        }

        const newLearning = new LearningEntity({
          user: user._id as Types.ObjectId,
          training: training._id as Types.ObjectId,

          userId: user.userId,
          trainingId: training.trainingId,

          lessons: lessons,
          accessStatus: await this.calculateAccess(user, training),
          progressStatus: LearningProgressStatus.NOT_STARTED,
        });

        console.log(newLearning)

        learning = await this.learningRepository.create(newLearning);

        console.log(learning);
      }

      learning = learning.updateAccessStatus(
        await this.calculateAccess(user, training)
      );

      learning.lessons.forEach(async ({ lessonId }) => {
        const lessonEntity = await this.contentService.findLesson({
          lessonId,
        });

        if (!lessonEntity || !learning) return;

        learning = learning.updateLessonAccessStatus(
          lessonId,
          await this.calculateAccess(user, lessonEntity)
        );
      });

      learning = await this.learningRepository.update(learning);

      return learning;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Ошибка';
      throw new InternalServerErrorException(message);
    }
  }

  async recalculateForUser(userId: number) {
    try {
      const user = await this.usersService.find({ userId });

      if (!user) {
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
        throw new NotFoundException('Тренинг не найден');
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

      await this.learningRepository.update(
        learning.updateProgressStatus(progress)
      );
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

      await this.learningRepository.update(
        learning.updateLessonProgressStatus(lessonId, progress)
      );

      return;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Ошибка';
      throw new InternalServerErrorException(message);
    }
  }
}
