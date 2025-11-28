// banner.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IBanner } from '@trinity/shared';
import { Document, Types } from 'mongoose';

@Schema({ versionKey: false, timestamps: true })
export class Banner extends Document<Types.ObjectId> implements IBanner {
  @Prop({ required: true, unique: true })
  bannerId!: number;

  @Prop({ type: String, default: null })
  miniatureUrl!: string | null;

  @Prop({ type: String, default: null })
  imageUrl!: string | null;

  @Prop({ type: String, default: null })
  linkUrl!: string | null;

  @Prop({ type: String, default: null })
  description!: string | null;

  // если viewedUsers хранят числовые userId:
  @Prop({ type: [Number], default: [] })
  viewedUsers!: number[];

  @Prop({ type: Date, default: null })
  endDate!: Date | null;
}

export const BannerSchema = SchemaFactory.createForClass(Banner);
