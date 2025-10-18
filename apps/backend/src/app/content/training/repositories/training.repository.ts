import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Training } from '../models';
import { TrainingEntity } from '../entities';

@Injectable()
export class TrainingRepository {
  constructor(
    @InjectModel(Training.name)
    private readonly trainingModel: Model<Training>
  ) {}

  // Создание тренинга
  async createTraining(
    trainingEntity: TrainingEntity
  ): Promise<TrainingEntity> {
    const newTraining = new this.trainingModel(trainingEntity);
    const saved = await newTraining.save();

    return new TrainingEntity(saved);
  }

  // Поиск тренинга
  async findTraining(
    condition: FilterQuery<Training>
  ): Promise<TrainingEntity | null> {
    const training = await this.trainingModel.findOne(condition).exec();
    return training ? new TrainingEntity(training) : null;
  }

  // Привязка parent ↔ child
  async bindParentAndChild(
    parentId: number | null,
    childId: number | null
  ): Promise<{ parent?: TrainingEntity; child?: TrainingEntity }> {
    if (!parentId && !childId) {
      throw new Error('Необходимо указать хотя бы один идентификатор');
    }

    // 🔹 Универсальная функция для установки корневого состояния
    const makeRoot = async (trainingId: number): Promise<TrainingEntity> => {
      const doc = await this.trainingModel.findOne({ trainingId });
      if (!doc) throw new Error('Тренинг не найден');

      await this.trainingModel.updateOne(
        { _id: doc._id },
        { $set: { parent: null, parentId: null, isRoot: true } }
      );

      const updated = await this.trainingModel.findById(doc._id).exec();
      if (!updated) throw new Error('Ошибка при обновлении тренинга');

      return new TrainingEntity(updated);
    };

    // 🧩 Если только один id передан → просто делаем корневым
    if (parentId && !childId) return { parent: await makeRoot(parentId) };
    if (childId && !parentId) return { child: await makeRoot(childId) };

    // 🧩 Если оба указаны → связываем
    const [parent, child] = await Promise.all([
      this.trainingModel.findOne({ trainingId: parentId }),
      this.trainingModel.findOne({ trainingId: childId }),
    ]);

    if (!parent || !child) {
      throw new Error('Родитель или дочерний тренинг не найден');
    }

    await Promise.all([
      // Обновляем родителя
      this.trainingModel.updateOne(
        { _id: parent._id },
        {
          $addToSet: {
            childrens: child._id,
            childrensId: child.trainingId,
          },
        }
      ),
      // Обновляем ребёнка
      this.trainingModel.updateOne(
        { _id: child._id },
        {
          $set: {
            parent: parent._id,
            parentId: parent.trainingId,
            isRoot: false,
          },
        }
      ),
    ]);

    const [updatedParent, updatedChild] = await Promise.all([
      this.trainingModel.findById(parent._id).exec(),
      this.trainingModel.findById(child._id).exec(),
    ]);

    if (!updatedParent || !updatedChild) {
      throw new Error('Ошибка при обновлении связей тренинга');
    }

    return {
      parent: new TrainingEntity(updatedParent),
      child: new TrainingEntity(updatedChild),
    };
  }
}
