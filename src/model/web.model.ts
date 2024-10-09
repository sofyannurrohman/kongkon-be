export class WebResponse<T> {
  status?: string;
  code?: number;
  message?: string;
  data?: T;
  errors?: string;
}
