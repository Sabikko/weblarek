import { IApi, IOrderRequest, IOrderResponse, IProduct } from "../../types";

export class WebLarekApi {
  constructor(private response: IApi) {}

  getProducts(): Promise<IProduct[]> {
    return this.response
      .get<{ total: number; items: IProduct[] }>("/product")
      .then((r) => r.items);
  }

  sendOrder(order: IOrderRequest): Promise<IOrderResponse> {
    return this.response.post<IOrderResponse>("/order", order);
  }
}