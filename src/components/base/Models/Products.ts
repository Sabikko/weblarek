import { IProduct } from "../../../types";

export class Products {
    protected products: IProduct[] = [];
    protected previewProduct: IProduct | null = null;

    constructor(products: IProduct[] = []) {
        this.products = products;
    }

    setProducts(products: IProduct[]): void {
        this.products = products;
    }

    getProducts(): IProduct[] {
        return this.products;
    }

    getProductById(id: string): IProduct | undefined {
        return this.products.find((product) => product.id === id);
    }

    setPreviewProduct(product: IProduct): void {
        this.previewProduct = product;
    }

    getPreviewProduct(): IProduct | null {
        return this.previewProduct;
    }
}