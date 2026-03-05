import { IApi, IProduct, IOrderRequest, IOrderResponse } from "../../../types";

export class ApiClient {
  protected api: IApi;

  constructor(api: IApi) {
    this.api = api;
  }

  getProducts(): Promise<IProduct[]> {
    return this.api
      .get<{ items: IProduct[] }>('/product/')
      .then((data) => data.items);
  }

  createOrder(order: IOrderRequest): Promise<IOrderResponse> {
    return this.api.post<IOrderResponse>('/order/', order);
  }
}