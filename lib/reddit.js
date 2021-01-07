const { Client } = require("node-reddit-js");

const { FORBIDDEN_WORDS } = require("../consts/constants");

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

  // Маппировать эти данные
  const re = children.map((record) => {
    const {
      data: { title, url, is_video, media },
    } = record;
    return { title, url, is_video, media };
  });
  // Подготовить запрещённые слова к процедуре фильтрации
  const forbiddenWords = FORBIDDEN_WORDS.toLowerCase().split(/[ ,]+/);
  // Отфильтровать

  return re.filter((r) =>
    forbiddenWords.reduce(
      (reduceBool, word) =>
        // Исключить из всего этого видео. Я пока не умею его забирать
        reduceBool &&
        !r.media &&
        r.title.toLowerCase().indexOf(word) === -1 &&
        !!r.url.match(/.(jpg|jpeg|png|gif)$/i),
      true
    )
  );
};

/**
 * Подготовка для отправки в телеграм
 */
exports.mapRedditForTelegram = (reddit) => ({
  type: reddit.is_video ? "video" : "photo",
  media: reddit.url,
  caption: reddit.title,
});
