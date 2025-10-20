import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ILesson, ITraining } from '@trinity/shared';
import { Document, Types } from 'mongoose';

@Schema()
export class Training extends Document<Types.ObjectId> implements ITraining {
  @Prop({ required: true, unique: true })
  trainingId!: number;

  @Prop({ required: true })
  title!: string;

  @Prop({ default: '' })
  description!: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Lesson' }], default: () => [] })
  lessons!: Types.ObjectId[] | ILesson[];

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Training' }],
    default: () => [],
  })
  childrens!: Types.ObjectId[] | ITraining[];

  @Prop({ type: Types.ObjectId, ref: 'Training', default: null })
  parent!: Types.ObjectId | ITraining | null;

  @Prop({ type: [Number], default: () => [] })
  lessonsId!: number[];

  @Prop({ type: [Number], default: () => [] })
  childrensId!: number[];

  @Prop({ type: Number, default: null })
  parentId!: number | null;

  @Prop({ default: true })
  isRoot!: boolean;
}

export const TrainingSchema = SchemaFactory.createForClass(Training);
