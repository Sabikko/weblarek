import { IEvents } from "../base/Events";
import { ensureElement, ensureAllElements } from "../../utils/utils";
import { Form } from "./Form";
import { TPayment } from "../../types";

export interface IFormPayment {
  payment: TPayment | null;
  address: string;
}

export class FormPayment extends Form<IFormPayment> {
  private readonly paymentButtons: HTMLButtonElement[];
  protected addressInput: HTMLInputElement;

  constructor(container: HTMLFormElement, events: IEvents) {
    super(container, events);

    this.paymentButtons = ensureAllElements<HTMLButtonElement>(
      ".order__buttons .button",
      this.container,
    );
    this.addressInput = ensureElement<HTMLInputElement>(
      'input[name="address"]',
      this.container,
    );

    this.paymentButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        this.events.emit("order.payment:change", {
          payment: button.name as TPayment,
        });
      });
    });
  }

  set payment(value: TPayment | null) {
    this.paymentButtons.forEach((button) => {
      button.classList.toggle("button_alt-active", button.name === value);
    });
  }

  set address(value: string) {
    this.addressInput.value = value;
  }
}
