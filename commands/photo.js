const { randomAnimal } = require("../lib/animalPhoto");

/**
 * Отправить случайное фото животинки забавной
 * @param {Object} prop
 * @param {Object} prop.telegram
 * @param {string} prop.whatAnimal
 * @param {number} prop.chatId
 */
const randomPhoto = async ({ telegram, whatAnimal = "", chatId }) => {
  telegram.sendMessage(chatId, "Ищу фото ...");
  const url = await randomAnimal(whatAnimal);
  // Предусмотрительно защититься от null, который может внезапно прийти из апи (увы, да)
  if (!url) {
    return telegram.sendMessage(chatId, "Поиск фото не удался");
  }
  // А это что- gif, что ли пришёл, да?
  const extension = url.split(".").pop();
  if (extension.toLowerCase() === "gif") {
    return telegram.sendAnimation(chatId, url);
  }
  return telegram.sendPhoto(chatId, url);
};

module.exports = randomPhoto;
