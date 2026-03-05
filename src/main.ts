import './scss/styles.scss';
import { API_URL } from './utils/constants';
import { apiProducts } from './utils/data';
import { Api } from './components/base/Api';
import { ApiClient } from './components/Models/ApiClient';

import { Products } from './components/Models/Products';
import { Basket } from './components/Models/Basket';
import { Buyer } from './components/Models/Buyer';

const api = new Api(API_URL);
const apiClient = new ApiClient(api);

// Каталог товаров

const productsModel = new Products();

async function init() {
  try {
    const products = await apiClient.getProducts();

    productsModel.setProducts(products);

    console.log('Каталог товаров с сервера:', productsModel.getProducts());
  } catch (error) {
    console.error('Ошибка получения товаров:', error);
  }
}

init();

// сохраняем товары из тестовых данных
productsModel.setProducts(apiProducts.items);

// проверяем получение всех товаров
console.log('Массив товаров из каталога:', productsModel.getProducts());

// проверяем получение товара по id
const firstProduct = productsModel.getProducts()[0];
console.log('Первый товар:', firstProduct);

const productById = productsModel.getProductById(firstProduct.id);
console.log('Товар найденный по id:', productById);

// проверяем сохранение товара для предпросмотра
productsModel.setPreviewProduct(firstProduct);
console.log('Товар для подробного отображения:', productsModel.getPreviewProduct());

// Корзина

const basketModel = new Basket();

// добавляем товар в корзину
basketModel.addItem(firstProduct);
console.log('Корзина после добавления товара:', basketModel.getItems());

// проверяем наличие товара
console.log(
  'Есть ли товар в корзине:',
  basketModel.hasItem(firstProduct.id)
);

// проверяем количество товаров
console.log('Количество товаров в корзине:', basketModel.getItemsCount());

// проверяем стоимость товаров
console.log('Общая стоимость корзины:', basketModel.getTotalPrice());

// удаляем товар
basketModel.removeItem(firstProduct);
console.log('Корзина после удаления товара:', basketModel.getItems());

// очищаем корзину
basketModel.clear();
console.log('Корзина после очистки:', basketModel.getItems());

// Покупатель

const buyerModel = new Buyer();

// сохраняем данные покупателя
buyerModel.setData({
  payment: 'online',
  email: 'test@mail.com',
  phone: '+79999999999',
  address: 'Москва'
});

// получаем данные покупателя
console.log('Данные покупателя:', buyerModel.getData());

// проверяем валидацию
console.log('Ошибки валидации:', buyerModel.validate());

// очищаем данные
buyerModel.clear();
console.log('Данные покупателя после очистки:', buyerModel.getData());

// проверяем валидацию после очистки
console.log('Ошибки после очистки:', buyerModel.validate());