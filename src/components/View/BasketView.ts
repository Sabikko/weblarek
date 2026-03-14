import { Component } from "../base/Component";
import { IEvents } from "../base/Events";
import { ensureElement } from "../../utils/utils";

export interface IBasket {
  items: HTMLElement[];
  total: number;
  disabled: boolean;
}

export class BasketView extends Component<IBasket> {
  protected listElements: HTMLElement;
  protected totalElements: HTMLElement;
  protected orderButton: HTMLButtonElement;

  constructor(
    container: HTMLElement,
    protected events: IEvents,
  ) {
    super(container);

    this.listElements = ensureElement<HTMLElement>(
      ".basket__list",
      this.container,
    );
    this.totalElements = ensureElement<HTMLElement>(
      ".basket__price",
      this.container,
    );
    this.orderButton = ensureElement<HTMLButtonElement>(
      ".basket__button",
      this.container,
    );

    this.orderButton.addEventListener("click", () => {
      this.events.emit("basket:submit");
    });
  }

  set items(items: HTMLElement[]) {
    if (items.length > 0) {
      this.buttonDisabled = false;
      this.listElements.replaceChildren(...items);
    } else {
      const emptyCart = document.createElement('p');
      emptyCart.textContent = 'Корзина пуста';
      this.buttonDisabled = true;
      this.listElements.replaceChildren(emptyCart);
    }
  };

  set total(value: number) {
    this.totalElements.textContent = `${value} синапсов`;
  }

  set buttonDisabled(value: boolean) {
    this.orderButton.disabled = value;
  };
}
