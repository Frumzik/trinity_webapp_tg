export class BaseResponseDto<T> {
  success!: boolean;
  message?: string[] | null;
  data!: T | null;

  constructor(props: Partial<BaseResponseDto<T>>) {
    Object.assign(this, props);
  }
}
