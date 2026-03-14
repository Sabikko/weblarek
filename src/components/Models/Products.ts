import { IProduct } from "../../types";
import { IEvents } from '../base/Events';

export class Products {
  protected products: IProduct[] = [];
  protected previewProduct: IProduct | null = null;

  constructor(private events: IEvents) {}

  setProducts(products: IProduct[]): void {
    this.products = products;
    this.events.emit('catalog:changed');
  }

  getProducts(): IProduct[] {
    return this.products;
  }

  getProductById(id: string): IProduct | undefined {
    return this.products.find((product) => product.id === id);
  }

  setPreviewProduct(product: IProduct | null): void {
    this.previewProduct = product;
    this.events.emit('preview:changed');
  }

  getPreviewProduct(): IProduct | null {
    return this.previewProduct;
  }
}