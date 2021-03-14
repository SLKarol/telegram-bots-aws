const { Client } = require("node-reddit-js");

const { FORBIDDEN_WORDS } = require("../consts/constants");
const { isCorrectImage } = require("../lib/common");

/**
 * Получает новые записи NFSW
 * @returns {Promise}
 */
exports.getNewRecords = async (limit = 20, callback) => {
  // Настроить клиента
  const client = new Client({
    id: process.env.REDDIT_APP_ID,
    secret: process.env.REDDIT_API_SECRET,
    username: process.env.REDDIT_USER_NAME,
    password: process.env.REDDIT_PASSWORD,
  });
  client.reddit.r.nsfw.new.get({ data: { limit } }).then(callback);
  /*
  // Получить данные
  const {
    data: { children },
  } = await client.reddit.r.nsfw.new.get({ data: { limit } });

  let filteredRecords = filterAllowContent(prepareRecords(children));
  const re = [];
  for (record of filteredRecords) {
    const { title, url, is_video } = record;
    const isCorrect = await isCorrectImage(url);
    if (isCorrect) {
      re.push({ title, url, is_video });
    }
  }
  return re;
  */
};

/**
 * Фильтровать по содержимому:
 * По заголовку и по расширению
 * @param {Array} data
 * @returns {Array}
 */
exports.filterAllowContent = (data) => {
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
};

/**
 * Подготовить массив к обработке - убрать из него лишнюю информацию
 * @param {Array} data
 * @returns {Array}
 */
exports.prepareRecords = (data) => {
  return data.map((record) => {
    const {
      data: { title, url, is_video, media },
    } = record;
    return { title, url, is_video, media };
  });
};

/**
 * Проверка корректности изображений для отправки в телеграм: ширина, высота, размер
 * @param {Array} records
 * @param {Function} callback
 * @returns {Promise}
 */
exports.checkCorrectImages = async (records, callback) => {
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
  Promise.all(promises).then(callback);
};

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
exports.getPartsMessage = (friDay) => {
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
};
