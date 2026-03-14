import { Component } from '../base/Component';

interface IGallery {
  catalogElements: HTMLElement[];
}

export class Gallery extends Component<IGallery> {
  constructor(container: HTMLElement) {
    super(container);
  }

  set catalogElements(elements: HTMLElement[]) {
    this.container.replaceChildren(...elements);
  }
}