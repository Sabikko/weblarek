import { ICard, Card } from "./Card";
import { ensureElement } from "../../utils/utils";
import { CDN_URL, categoryMap } from "../../utils/constants";

interface ICardActions {
  onClick: () => void;
}

export interface ICardCatalog extends ICard {
  category: string;
  image: string;
}

export class CardCatalog extends Card<ICardCatalog> {
  protected categoryElement: HTMLElement;
  protected imageElement: HTMLImageElement;

  constructor(container: HTMLElement, selected: ICardActions) {
    super(container);

    this.categoryElement = ensureElement<HTMLElement>(
      ".card__category",
      this.container,
    );
    this.imageElement = ensureElement<HTMLImageElement>(
      ".card__image",
      this.container,
    );

    this.container.addEventListener("click", () => {
      selected.onClick();
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
}
