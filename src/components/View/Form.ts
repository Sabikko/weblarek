import { Component } from "../base/Component";
import { IEvents } from "../base/Events";
import { ensureElement } from "../../utils/utils";

export interface IFormState {
  valid: boolean;
  errors: string;
}

type TFormChangeData = {
  field: string;
  value: string;
};

export abstract class Form<T> extends Component<T & IFormState> {
  declare protected readonly container: HTMLFormElement;
  protected readonly submitButtonElement: HTMLButtonElement;
  protected readonly errorElement: HTMLElement;

  constructor(
    container: HTMLFormElement,
    protected events: IEvents,
  ) {
    super(container);

    this.submitButtonElement = ensureElement<HTMLButtonElement>(
      'button[type="submit"]',
      this.container,
    );
    this.errorElement = ensureElement<HTMLElement>(
      ".form__errors",
      this.container,
    );

    this.container.addEventListener("submit", (event) => {
      event.preventDefault();
      this.events.emit(`${this.container.name}:submit`);
    });

    this.container.addEventListener("input", (event) => {
      const target = event.target;

      if (!(target instanceof HTMLInputElement)) {
        return;
      }

      this.events.emit<TFormChangeData>(
        `${this.container.name}.${target.name}:change`,
        {
          field: target.name,
          value: target.value,
        },
      );
    });
  }

  set valid(value: boolean) {
    this.submitButtonElement.disabled = !value;
  }

  set errors(value: string) {
    this.errorElement.textContent = value;
  }
}
