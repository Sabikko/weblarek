import { IBuyer, TPayment } from "../../../types";

type BuyerErrors = Partial<Record<keyof IBuyer, string>>;

export class Buyer {
  protected payment: TPayment | null = null;
  protected email: string = '';
  protected phone: string = '';
  protected address: string = '';

  constructor(data?: Partial<IBuyer>) {
    if (data) {
      this.setData(data);
    }
  }

  setData(data: Partial<IBuyer>): void {
    if (data.payment !== undefined) {
      this.payment = data.payment;
    }

    if (data.email !== undefined) {
      this.email = data.email;
    }

    if (data.phone !== undefined) {
      this.phone = data.phone;
    }

    if (data.address !== undefined) {
      this.address = data.address;
    }
  }

  getData(): IBuyer {
    return {
      payment: this.payment as TPayment,
      email: this.email,
      phone: this.phone,
      address: this.address,
    };
  }

  clear(): void {
    this.payment = null;
    this.email = '';
    this.phone = '';
    this.address = '';
  }

  validate(): BuyerErrors {
    const errors: BuyerErrors = {};

    if (!this.payment) {
      errors.payment = 'Не выбран вид оплаты';
    }

    if (!this.email) {
      errors.email = 'Укажите емэйл';
    }

    if (!this.phone) {
      errors.phone = 'Укажите телефон';
    }

    if (!this.address) {
      errors.address = 'Укажите адрес';
    }

    return errors;
  }
}