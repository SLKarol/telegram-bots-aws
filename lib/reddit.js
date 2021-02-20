const { Client } = require("node-reddit-js");
const probe = require("probe-image-size");

const { FORBIDDEN_WORDS } = require("../consts/constants");
const { isCorrectImage, downloadImage } = require("../lib/common");

/**
 * Получает новые записи NFSW
 */
exports.getNewRecords = async (limit = 20) => {
  // Настроить клиента
  const client = new Client({
    id: process.env.REDDIT_APP_ID,
    secret: process.env.REDDIT_API_SECRET,
    username: process.env.REDDIT_USER_NAME,
    password: process.env.REDDIT_PASSWORD,
  });
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
};

/**
 * Подготовка для отправки в телеграм
 */
exports.mapRedditForTelegram = (reddit) => ({
  type: reddit.is_video ? "video" : "photo",
  media: reddit.url,
  caption: reddit.title,
});

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
