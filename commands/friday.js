const getFridayContent = require("../lib/reddit");
const { delay } = require("../lib/common");

/**
 * Вывести все данные для пятничного выпуска
 * @param {Object} prop
 * @param {TelegrafContext} prop.telegram
 * @param {number} prop.chatId
 */
const friday = async ({ telegram, chatId }) => {
  await telegram.sendMessage(
    chatId,
    "Готовятся материалы для публикации в этом чате."
  );
  // Получить массив сообщений для пятничного контента
  const fridayMessages = await getFridayContent();
  for (group of fridayMessages) {
    // Если это альбом, то отправить альбом ...
    if (group.length > 1) {
      try {
        await telegram.sendMediaGroup(chatId, group, {
          disable_notification: true,
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      // Если это всего лишь одно фото, то отправить одно фото
      const [photo] = group;
      telegram.sendPhoto(
        chatId,
        { url: photo.url },
        { caption: photo.title, disable_notification: true }
      );
    }
    await delay();
  }
  return telegram.sendMessage(chatId, "Задача выполнена.");
};

module.exports = friday;
