import { Component } from "../base/Component";
import { IEvents } from "../base/Events";
import { ensureElement } from "../../utils/utils";

export interface IBasket {
  items: HTMLElement[];
  total: number;
  disabled: boolean;
}

export class BasketView extends Component<IBasket> {
  protected listElement: HTMLElement;
  protected totalElement: HTMLElement;
  protected orderButton: HTMLButtonElement;

  constructor(
    container: HTMLElement,
    protected events: IEvents,
  ) {
    super(container);

    this.listElement = ensureElement<HTMLElement>(
      ".basket__list",
      this.container,
    );

    this.totalElement = ensureElement<HTMLElement>(
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
    this.listElement.replaceChildren(...items);
  }

  set total(value: number) {
    this.totalElement.textContent = `${value} синапсов`;
  }

  set disabled(value: boolean) {
    this.orderButton.disabled = value;
  }
}