import { Types } from 'mongoose';

export interface ITraining {
  trainingId: number;
  _id?: Types.ObjectId;
  title: string;
  description?: string;
  // Уроки, входящие в тренинг
  lessons?: Types.ObjectId[] | ILesson[];
  // Вложенные блоки (дочерние тренинги)
  childrens?: Types.ObjectId[] | ITraining[];
  // Ссылка на родителя (если есть)
  parent?: Types.ObjectId | ITraining | null;

  lessonsId: number[];
  childrensId: number[];
  parentId: number | null;
  isRoot: boolean;
}

export interface ILesson {
  lessonId: number;
  _id?: Types.ObjectId;
  title: string;
  description?: string;

  parent?: Types.ObjectId | ITraining;
  parentId: number;
}
