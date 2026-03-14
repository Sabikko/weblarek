import "./scss/styles.scss";

import { EventEmitter } from "./components/base/Events";
import { cloneTemplate, ensureElement } from "./utils/utils";

import { Api } from "./components/base/Api";
import { API_URL } from "./utils/constants";
import { WebLarekApi } from "./components/base/WebLarekApi";

// Models
import { Products } from "./components/Models/Products";
import { Basket } from "./components/Models/Basket";
import { Buyer } from "./components/Models/Buyer";

// Views
import { Header } from "./components/View/Header";
import { Gallery } from "./components/View/Gallery";
import { Modal } from "./components/View/Modal";
import { FormContacts } from "./components/View/FormContacts";
import { FormPayment } from "./components/View/FormPayment";
import { BasketView } from "./components/View/BasketView";
import { SuccessView } from "./components/View/SuccessView";
import { CardCatalog } from "./components/View/CardCatalog";
import { CardPreview } from "./components/View/CardPreview";
import { CardBasket } from "./components/View/CardBasket";

import { TPayment } from "./types";

// CORE

const events = new EventEmitter();
const api = new WebLarekApi(new Api(API_URL));

const productsModel = new Products(events);
const basketModel = new Basket(events);
const customerModel = new Buyer(events);

// DOM

const headerElement = ensureElement<HTMLElement>(".header");
const modalElement = ensureElement<HTMLElement>(".modal");

const cardCatalogTemplate = ensureElement<HTMLTemplateElement>("#card-catalog");
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>("#card-preview");
const cardBasketTemplate = ensureElement<HTMLTemplateElement>("#card-basket");

const formPaymentTemplate = ensureElement<HTMLTemplateElement>("#order");
const formContactsTemplate = ensureElement<HTMLTemplateElement>("#contacts");

const basketTemplate = ensureElement<HTMLTemplateElement>("#basket");
const successTemplate = ensureElement<HTMLTemplateElement>("#success");

// VIEWS

const header = new Header(headerElement, events);
const gallery = new Gallery(ensureElement<HTMLElement>(".gallery"));
const modal = new Modal(modalElement, events);

const basketView = new BasketView(cloneTemplate(basketTemplate), events);
const formPayment = new FormPayment(cloneTemplate(formPaymentTemplate), events);
const formContacts = new FormContacts(
  cloneTemplate(formContactsTemplate),
  events,
);
const successView = new SuccessView(cloneTemplate(successTemplate), events);

const cardPreview = new CardPreview(cloneTemplate(cardPreviewTemplate), {
  onToggleCart: () => {
    events.emit("preview:toggle");
  },
});

// HELPERS

function formatErrors(messages: Array<string | undefined>): string {
  return messages.filter(Boolean).join("; ");
}

function openModal(content: HTMLElement): void {
  modal.render({ content });
  modal.open();
}

// RENDER

function renderBasket(): HTMLElement {
  const items = basketModel.getItems().map((item, index) => {
    const card = new CardBasket(cloneTemplate(cardBasketTemplate), {
      onDelete: () => {
        basketModel.removeItem(item);
      },
    });

    return card.render({
      title: item.title,
      price: item.price,
      index: index + 1,
    });
  });

  return basketView.render({
    items,
    total: basketModel.getTotalPrice(),
    disabled: basketModel.getItemsCount() === 0,
  });
}

function renderOrder(): HTMLElement {
  const data = customerModel.getData();
  const errors = customerModel.validate();

  return formPayment.render({
    payment: data.payment,
    address: data.address,
    valid: !errors.payment && !errors.address,
    errors: formatErrors([errors.payment, errors.address]),
  });
}

function renderContacts(): HTMLElement {
  const data = customerModel.getData();
  const errors = customerModel.validate();

  return formContacts.render({
    email: data.email,
    phone: data.phone,
    valid: !errors.email && !errors.phone,
    errors: formatErrors([errors.email, errors.phone]),
  });
}

function renderPreview(): void {
  const product = productsModel.getPreviewProduct();

  if (!product) {
    return;
  }

  const inBasket = basketModel.hasItem(product.id);
  const unavailable = product.price === null;

  const buttonTitle = unavailable
    ? "Недоступно"
    : inBasket
      ? "Удалить из корзины"
      : "Купить";

  openModal(
    cardPreview.render({
      title: product.title,
      price: product.price,
      category: product.category,
      image: product.image,
      description: product.description,
      buttonTitle,
      buttonDisabled: unavailable,
    }),
  );
}

function renderSuccess(total: number): void {
  openModal(successView.render({ total }));
}

// EVENTS

events.on("catalog:changed", () => {
  const cards = productsModel.getProducts().map((product) => {
    const card = new CardCatalog(cloneTemplate(cardCatalogTemplate), {
      onClick: () => {
        productsModel.setPreviewProduct(product);
      },
    });

    return card.render({
      title: product.title,
      price: product.price,
      category: product.category,
      image: product.image,
    });
  });

  gallery.render({ catalogElements: cards });
});

events.on("preview:changed", () => {
  renderPreview();
});

events.on("preview:toggle", () => {
  const product = productsModel.getPreviewProduct();

  if (!product || product.price === null) {
    return;
  }

  if (basketModel.hasItem(product.id)) {
    basketModel.removeItem(product);
  } else {
    basketModel.addItem(product);
  }
});

events.on("basket:open", () => {
  openModal(renderBasket());
});

events.on('basket:changed', () => {
  header.render({
    counter: basketModel.getItemsCount(),
  });

  renderBasket();

  if (productsModel.getPreviewProduct()) {
    renderPreview();
  }
});

events.on("buyer:changed", () => {
  renderOrder();
  renderContacts();
});

events.on("basket:submit", () => {
  openModal(renderOrder());
});

events.on<{ payment: TPayment }>("order.payment:change", ({ payment }) => {
  customerModel.setData({ payment });
});

events.on<{ value: string }>("order.address:change", ({ value }) => {
  customerModel.setData({ address: value });
});

events.on("order:submit", () => {
  openModal(renderContacts());
});

events.on<{ value: string }>("contacts.email:change", ({ value }) => {
  customerModel.setData({ email: value });
});

events.on<{ value: string }>("contacts.phone:change", ({ value }) => {
  customerModel.setData({ phone: value });
});

events.on("contacts:submit", () => {

  const data = customerModel.getData();
  const items = basketModel.getItems();

  api
    .sendOrder({
      payment: data.payment!,
      email: data.email!,
      phone: data.phone!,
      address: data.address!,
      items: items.map((item) => item.id),
      total: basketModel.getTotalPrice(),
    })
    .then((result) => {
      productsModel.setPreviewProduct(null);
      basketModel.clear();
      customerModel.clear();
      renderSuccess(result.total);
    })
    .catch((error: unknown) => {
      console.error("Ошибка оформления заказа:", error);
    });
});

events.on("success:close", () => {
  modal.close();
});

// INIT

header.render({
  counter: basketModel.getItemsCount(),
});

renderBasket();
renderOrder();
renderContacts();

api
  .getProducts()
  .then((products) => {
    productsModel.setProducts(products);
  })
  .catch((error: unknown) => {
    console.error("Ошибка загрузки товаров:", error);
  });
