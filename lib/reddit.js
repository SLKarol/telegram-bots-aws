const { Client } = require("node-reddit-js");

const { FORBIDDEN_WORDS } = require("../consts/constants");
const { isCorrectImage } = require("../lib/common");

/**
 * Получает новые записи NFSW
 * @returns {Promise}
 */
async function getNewRecords(limit = 20) {
  // Настроить клиента
  const client = new Client({
    id: process.env.REDDIT_APP_ID,
    secret: process.env.REDDIT_API_SECRET,
    username: process.env.REDDIT_USER_NAME,
    password: process.env.REDDIT_PASSWORD,
  });
  return client.reddit.r.nsfw.new.get({ data: { limit } });
}

/**
 * Фильтровать по содержимому:
 * По заголовку и по расширению
 * @param {Array} data
 * @returns {Array}
 */
function filterAllowContent(data) {
  const forbiddenWords = FORBIDDEN_WORDS.toLowerCase().split(/[ ,]+/);
  // Отфильтровать
  return data.filter((r) => {
    // Исключить из всего этого видео. Я пока не умею его забирать
    const { media, title, url } = r;
    const tmpLowerCase = title.toLowerCase();
    const notForbidden = !forbiddenWords.some(
      (word) => tmpLowerCase.indexOf(word) > -1
    );
    return !media && !!url.match(/.(jpg|jpeg|png|gif)$/i) && notForbidden;
  });
}

/**
 * Подготовить массив к обработке - убрать из него лишнюю информацию
 * @param {Array} data
 * @returns {Array}
 */
function prepareRecords(data) {
  return data.map((record) => {
    const {
      data: { title, url, is_video, media },
    } = record;
    return { title, url, is_video, media };
  });
}

/**
 * Проверка корректности изображений для отправки в телеграм: ширина, высота, размер
 * @param {Array} records
 * @param {Function} callback
 * @returns {Promise}
 */
async function checkCorrectImages(records, callback) {
  const promises = [];
  for (record of records) {
    promises.push(
      new Promise((resolve, reject) => {
        const { title, url, is_video } = record;
        resolve(
          isCorrectImage(url).then((correct) => ({
            title,
            url,
            is_video,
            correct,
          }))
        );
      })
    );
  }
  return Promise.all(promises);
}

/**
 * Подготовка для отправки в телеграм
 */
const mapRedditForTelegram = (reddit) => ({
  type: reddit.is_video ? "video" : "photo",
  media: reddit.url,
  caption: reddit.title,
});

/**
 * Группировка изображений для создания отправки в телеграмм
 * @param {Array} friDay Массив изображений
 * @returns {Array}
 */
function getPartsMessage(friDay) {
  //массив, в который будет выведен результат.
  let fridayMessages = [];
  const size = 10;
  // Получить массив из частей по size штук
  for (let i = 0; i < Math.ceil(friDay.length / size); i++) {
    fridayMessages[i] = friDay
      .slice(i * size, i * size + size)
      // Подготовить эти 10 записей к отправке в телеграм
      .map(mapRedditForTelegram);
  }
  return fridayMessages;
}

/**
 * Вернуть содержимое пятничного выпуска
 */
const getFridayContent = async () => {
  return getNewRecords(20)
    .then((response) => {
      const {
        data: { children },
      } = response;
      let filteredRecords = filterAllowContent(prepareRecords(children));
      return checkCorrectImages(filteredRecords);
    })
    .then((records) =>
      getPartsMessage(records.filter((record) => record.correct))
    );
};

module.exports = getFridayContent;

//--- Примеры отправки сообщения не через библиотеку
// 1 example
// let url = new URL(
//   `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN_FRIDAY}/sendMediaGroup`
// );
// const params = { chat_id: chatId };
// for (group of fridayMessages) {
//   params.media = JSON.stringify(group);
//   url.search = new URLSearchParams(params).toString();
//   try {
//     await fetch(url);
//     await delay();
//   } catch (e) {
//     console.error(e);
//   }
// }
// 2 example
// let url = new URL(
//   `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN_FRIDAY}/sendPhoto`
// );
// const params = { chat_id: chatId, disable_notification: true };
// for (photo of friDay) {
//   params.photo = photo.url;
//   params.caption = photo.title;
//   url.search = new URLSearchParams(params).toString();
//   try {
//     await fetch(url);
//     await delay();
//   } catch (e) {
//     console.error(e);
//   }
// }
