import { Component } from "../base/Component";
import { IEvents } from "../base/Events";
import { ensureElement } from "../../utils/utils";

export interface IModal {
  content: HTMLElement;
}

export class Modal extends Component<IModal> {
  protected contentElement: HTMLElement;
  protected closeButton: HTMLButtonElement;

  constructor(
    container: HTMLElement,
    protected events: IEvents,
  ) {
    super(container);

    this.contentElement = ensureElement<HTMLElement>(
      ".modal__content",
      this.container,
    );
    this.closeButton = ensureElement<HTMLButtonElement>(
      ".modal__close",
      this.container,
    );

    this.closeButton.addEventListener("click", () => {
      this.events.emit("modal:close");
    });

    this.container.addEventListener("click", (event) => {
      if (event.target === this.container) {
        this.events.emit("modal:close");
      }
    });
  }

  set content(value: HTMLElement) {
    this.contentElement.replaceChildren(value);
  }

  private closeByEsc = (event: KeyboardEvent): void => {
    if (event.key === "Escape") {
      this.events.emit("modal:close");
    }
  };

  open(): void {
    this.container.classList.add("modal_active");
    document.addEventListener('keydown', this.closeByEsc);
  }

  close(): void {
    this.container.classList.remove("modal_active");
    document.removeEventListener('keydown', this.closeByEsc);
    this.events.emit("modal:close");
  }
}
