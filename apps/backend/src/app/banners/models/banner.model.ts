// banner.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IBanner } from '@trinity/shared';
import { Document, Types } from 'mongoose';

@Schema({ versionKey: false, timestamps: true })
export class Banner extends Document<Types.ObjectId> implements IBanner {
  @Prop({ required: true, unique: true })
  bannerId!: number;

  @Prop({ required: true })
  miniatureUrl!: string;

  @Prop({ required: true })
  imageUrl!: string;

  @Prop({ type: String, default: null })
  linkUrl!: string | null;

  // если viewedUsers хранят числовые userId:
  @Prop({ type: [Number], default: [] })
  viewedUsers!: number[];

  @Prop({ type: Date, default: null })
  endDate!: Date | null;
}

export const BannerSchema = SchemaFactory.createForClass(Banner);
