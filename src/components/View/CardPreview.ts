import { Card, ICard } from "./Card";
import { ensureElement } from "../../utils/utils";
import { CDN_URL, categoryMap } from "../../utils/constants";

interface ICardPreviewActions {
    onToggleCart: () => void;
}

export interface ICardPreview extends ICard {
  category: string;
  image: string;
  description: string;
  buttonDisabled: boolean;
  buttonTitle: string;
}

export class CardPreview extends Card<ICardPreview> {
  protected descriptionElement: HTMLElement;
  protected categoryElement: HTMLElement;
  protected imageElement: HTMLImageElement;
  protected cardButtonElement: HTMLButtonElement;

  constructor(
    container: HTMLElement,
    actions: ICardPreviewActions
  ) {
    super(container);

    this.categoryElement = ensureElement<HTMLElement>(
      ".card__category",
      this.container,
    );
    this.imageElement = ensureElement<HTMLImageElement>(
      ".card__image",
      this.container,
    );
    this.descriptionElement = ensureElement<HTMLElement>(
      ".card__text",
      this.container,
    );
    this.cardButtonElement = ensureElement<HTMLButtonElement>(
      ".card__button",
      this.container,
    );

    this.cardButtonElement.addEventListener("click", () => {
      actions.onToggleCart();
    });
  }

  set category(value: string) {
    this.categoryElement.textContent = value;
    this.categoryElement.className = "card__category";
    const categoryClass = categoryMap[value as keyof typeof categoryMap];
    if (categoryClass) {
      this.categoryElement.classList.add(categoryClass);
    }
  }

  set image(value: string) {
    this.setImage(
      this.imageElement,
      `${CDN_URL}${value}`,
      this.titleElement.textContent || "Товар",
    );
  }

  set description(value: string) {
    this.descriptionElement.textContent = value;
  }

  set buttonTitle(value: string) {
    this.cardButtonElement.textContent = value;
  }

  set buttonDisabled(value: boolean) {
    this.cardButtonElement.disabled = value;
  }
}
