import {
  IsString,
  IsOptional,
  IsUrl,
  IsDate,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BannerCreateRequestDto {
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  @ApiProperty({
    description: 'Ссылка на миниатюру',
    example: 'https://domain.com/image.jpg',
  })
  miniatureUrl!: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  @ApiProperty({
    description: 'Ссылка на изображение',
    example: 'https://domain.com/image.jpg',
  })
  imageUrl!: string;

  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional({
    description: 'Описание',
    example: null,
    nullable: true,
  })
  description?: string | null;

  @IsOptional()
  @IsUrl()
  @ApiPropertyOptional({
    description: 'Ссылка при клике (или null)',
    example: 'https://domain.com/link',
  })
  linkUrl?: string | null;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @ApiPropertyOptional({
    description: 'Дата окончания',
    example: null,
    nullable: true,
  })
  endDate?: Date | null;
}
