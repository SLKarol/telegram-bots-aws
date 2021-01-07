const fetch = require("node-fetch");

/**
 * Случайное фото котофея
 */
const theCatApi = async () => {
  const response = await fetch("https://api.thecatapi.com/v1/images/search");
  const data = await response.json();
  return data.url;
};

/**
 * Ещё одно фото котёнка
 * ! Возможен Gif
 */
const randomCat = async () => {
  const response = await fetch("https://aws.random.cat/meow");
  const data = await response.json();
  return data.file;
};

/**
 * Собачка
 */
const dogCeo = async () => {
  const response = await fetch("https://dog.ceo/api/breeds/image/random");
  const data = await response.json();
  return data.message;
};

/**
 * Собачка 2
 */
const woof = async () => {
  const response = await fetch("https://random.dog/woof.json");
  const data = await response.json();
  return data.url;
};

/**
 * Лисичка
 *
 */
const randomFox = async () => {
  const response = await fetch("https://randomfox.ca/floof/");
  const data = await response.json();
  return data.image;
};

/**
 * Получить случайное фото
 * @param {'cat' | 'dog | 'fox'} animal
 */
exports.randomAnimal = async (animal = "") => {
  const listApi = [];
  if (!animal || animal[0] === "@") {
    listApi.push(theCatApi);
    listApi.push(randomCat);
    listApi.push(dogCeo);
    listApi.push(woof);
    listApi.push(randomFox);
  }
  const checkWord = animal.toLowerCase();
  if (checkWord === "cat") {
    listApi.push(theCatApi);
    listApi.push(randomCat);
  }
  if (checkWord === "dog") {
    listApi.push(dogCeo);
    listApi.push(woof);
  }
  if (checkWord === "fox") {
    listApi.push(randomFox);
  }
  if (listApi.length === 0) {
    return null;
  }
  return await listApi[Math.floor(Math.random() * listApi.length)]();
};
