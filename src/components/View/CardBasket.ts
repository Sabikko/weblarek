import { Card, ICard } from "./Card";
import { ensureElement } from "../../utils/utils";

export interface ICardBasket extends ICard {
  index: number;
}

export interface ICardBasketActions {
  onDelete: () => void;
}

export class CardBasket extends Card<ICardBasket> {
  protected indexElement: HTMLElement;
  protected deleteButtonElement: HTMLButtonElement;

  constructor(
    container: HTMLElement,
    protected action: ICardBasketActions,
  ) {
    super(container);

    this.indexElement = ensureElement<HTMLElement>(
      ".basket__item-index",
      this.container,
    );
    this.deleteButtonElement = ensureElement<HTMLButtonElement>(
      ".basket__item-delete",
      this.container,
    );

    this.deleteButtonElement.addEventListener("click", () => {
      action.onDelete();
    });
  }

  set index(value: number) {
    this.indexElement.textContent = String(value);
  }
}
