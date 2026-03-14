import './scss/styles.scss';

import { EventEmitter } from './components/base/Events';
import { cloneTemplate, ensureElement } from './utils/utils';

import { Api } from './components/base/Api';
import { API_URL } from './utils/constants';
import { WebLarekApi } from './components/base/WebLarekApi';

// Models
import { Products } from './components/Models/Products';
import { Basket } from './components/Models/Basket';
import { Buyer } from './components/Models/Buyer';

// import Views
import { Header } from './components/View/Header';
import { Gallery } from './components/View/Gallery';
import { Modal } from './components/View/Modal';
import { FormContacts } from './components/View/FormContacts';
import { FormPayment } from './components/View/FormPayment';
import { BasketView } from './components/View/BasketView';
import { SuccessView } from './components/View/SuccessView';
import { CardCatalog } from './components/View/CardCatalog';
import { CardPreview } from './components/View/CardPreview';
import { CardBasket } from './components/View/CardBasket';

import { TPayment } from './types';

// CORE

const events = new EventEmitter();
const api = new WebLarekApi(new Api(API_URL));

const productsModel = new Products(events);
const basketModel = new Basket(events);
const customerModel = new Buyer(events);

// DOM 

const headerElement = ensureElement('.header');
const modalElement = ensureElement('.modal');

const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');

const formPaymentTemplate = ensureElement<HTMLTemplateElement>('#order');
const formContactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');

const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

// VIEWS 

const header = new Header(headerElement, events);
const gallery = new Gallery(ensureElement('.gallery'));
const modal = new Modal(modalElement, events);

const basketView = new BasketView(cloneTemplate(basketTemplate), events);

const formPayment = new FormPayment(cloneTemplate(formPaymentTemplate), events);
const formContacts = new FormContacts(cloneTemplate(formContactsTemplate), events);

const successView = new SuccessView(cloneTemplate(successTemplate), events);

const cardPreview = new CardPreview(cloneTemplate(cardPreviewTemplate), {
  onToggleCart: () => {
    const product = productsModel.getPreviewProduct();
    if (!product) return;

    basketModel.hasItem(product.id)
      ? basketModel.removeItem(product)
      : basketModel.addItem(product);
  },
});

// STATE 

type TModalView = 'preview' | 'basket' | 'order' | 'contacts' | 'success' | null;

let activeModalView: TModalView = null;
let orderInteracted = false;

// HELPERS 

function formatErrors(messages: Array<string | undefined>): string {
  return messages.filter(Boolean).join('; ');
}

function setModalContent(
  content: HTMLElement,
  view: Exclude<TModalView, null>,
  open = true
) {
  const shouldReplace = open || activeModalView !== view;

  activeModalView = view;

  if (shouldReplace) modal.render({ content });
  if (open) modal.open();
}

function closeModal() {
  activeModalView = null;
  modal.close();
}

// RENDER

function renderBasket(open = true) {
  const items = basketModel.getItems().map((item, index) => {
    const card = new CardBasket(cloneTemplate(cardBasketTemplate), {
      onDelete: () => basketModel.removeItem(item),
    });

    return card.render({
      title: item.title,
      price: item.price,
      index: index + 1,
    });
  });

  setModalContent(
    basketView.render({
      items,
      total: basketModel.getTotalPrice(),
      disabled: basketModel.getItemsCount() === 0,
    }),
    'basket',
    open
  );
}

function renderOrder(open = true) {
  if (open) orderInteracted = false;

  const data = customerModel.getData();
  const errors = customerModel.validate();

  const orderErrors = orderInteracted
    ? formatErrors([errors.payment, errors.address])
    : '';

  setModalContent(
    formPayment.render({
      payment: data.payment,
      address: data.address,
      valid: !errors.payment && !errors.address,
      errors: orderErrors,
    }),
    'order',
    open
  );
}

function renderContacts(open = true) {
  const data = customerModel.getData();
  const errors = customerModel.validate();

  setModalContent(
    formContacts.render({
      email: data.email,
      phone: data.phone,
      valid: !errors.email && !errors.phone,
      errors: formatErrors([errors.email, errors.phone]),
    }),
    'contacts',
    open
  );
}

function renderPreview(open = true) {
  const product = productsModel.getPreviewProduct();
  if (!product) return;

  const inBasket = basketModel.hasItem(product.id);
  const unavailable = product.price === null;

  const buttonTitle = unavailable
    ? 'Недоступно'
    : inBasket
    ? 'Удалить из корзины'
    : 'Купить';

  setModalContent(
    cardPreview.render({
      title: product.title,
      price: product.price,
      category: product.category,
      image: product.image,
      description: product.description,
      buttonTitle,
      buttonDisabled: unavailable,
    }),
    'preview',
    open
  );
}

function renderSuccess(total: number) {
  setModalContent(successView.render({ total }), 'success');
}

// EVENTS

events.on('catalog:changed', () => {
  const cards = productsModel.getProducts().map((product) => {
    const card = new CardCatalog(cloneTemplate(cardCatalogTemplate), {
      onClick: () => productsModel.setPreviewProduct(product),
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

events.on('preview:changed', () => {
  const product = productsModel.getPreviewProduct();

  if (!product) {
    if (activeModalView === 'preview') closeModal();
    return;
  }

  renderPreview();
});

events.on('basket:open', () => renderBasket());

events.on('basket:changed', () => {
  header.render({ counter: basketModel.getItemsCount() });

  if (activeModalView === 'basket') renderBasket(false);

  if (activeModalView === 'preview' && productsModel.getPreviewProduct()) {
    renderPreview(false);
  }
});

events.on('buyer:changed', () => {
  if (activeModalView === 'order') renderOrder(false);
  if (activeModalView === 'contacts') renderContacts(false);
});

events.on('basket:submit', () => {
  if (basketModel.getItemsCount() === 0) return;
  renderOrder();
});

events.on<{ payment: TPayment }>('order.payment:change', ({ payment }) => {
  orderInteracted = true;
  customerModel.setData({ payment });
});

events.on<{ value: string }>('order.address:change', ({ value }) => {
  orderInteracted = true;
  customerModel.setData({ address: value });
});

events.on('order:submit', () => renderContacts());

events.on<{ value: string }>('contacts.email:change', ({ value }) => {
  customerModel.setData({ email: value });
});

events.on<{ value: string }>('contacts.phone:change', ({ value }) => {
  customerModel.setData({ phone: value });
});

events.on('contacts:submit', () => {
  const data = customerModel.getData();
  const items = basketModel.getItems();

  api
    .sendOrder({
      payment: data.payment!,
      email: data.email!,
      phone: data.phone!,
      address: data.address!,
      items: items.map((i) => i.id),
      total: basketModel.getTotalPrice(),
    })
    .then((result) => {
      renderSuccess(result.total);

      basketModel.clear();
      customerModel.clear();
      productsModel.setPreviewProduct(null);
    })
    .catch((error: unknown) => {
      console.error('Ошибка оформления заказа:', error);
    });
});

events.on('modal:close', () => {
  if (activeModalView === 'preview') {
    productsModel.setPreviewProduct(null);
    return;
  }

  activeModalView = null;
});

events.on('success:close', closeModal);

// INIT

header.render({ counter: basketModel.getItemsCount() });

api
  .getProducts()
  .then((products) => productsModel.setProducts(products))
  .catch((error: unknown) =>
    console.error('Ошибка загрузки товаров:', error)
  );