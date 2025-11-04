import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { FavoriteType, IFavorite, ITraining, ILesson } from '@trinity/shared'; // или путь до твоего enum'а

@Schema({ versionKey: false, timestamps: true })
export class Favorite extends Document<Types.ObjectId> implements IFavorite {
  @Prop({ enum: FavoriteType, type: String, required: true })
  type!: FavoriteType;

  @Prop({ required: true })
  favoriteId!: number;
  
  @Prop({ required: true })
  userId!: number;

  @Prop({ required: false })
  trainingId!: number;

  @Prop({ required: false })
  lessonId!: number;

  @Prop({ required: false, type: Types.ObjectId, ref: 'Training' })
  training!: Types.ObjectId | ITraining;

  @Prop({ required: false, type: Types.ObjectId, ref: 'Lesson' })
  lesson!: Types.ObjectId | ILesson;
}

export const FavoriteSchema = SchemaFactory.createForClass(Favorite);
