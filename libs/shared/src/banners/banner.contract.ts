export class BannerCreateRequestDto {
  miniatureUrl!: string;
  imageUrl!: string;
  linkUrl!: string | null;
  endDate!: Date | null;
}
