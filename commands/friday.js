const {
  getNewRecords,
  filterAllowContent,
  prepareRecords,
  checkCorrectImages,
  getPartsMessage,
} = require("../lib/reddit");
const { delay } = require("../lib/common");

/**
 * Вывести все данные для пятничного выпуска
 * @param {Object} prop
 * @param {TelegrafContext} prop.telegram
 * @param {boolean} prop.todayFriday
 * @param {number} prop.chatId
 */
const friday = async ({ telegram, chatId }) => {
  // Надпись о начале работы
  telegram.sendMessage(
    chatId,
    "Готовятся материалы для публикации в этом чате."
  );

  getNewRecords(20, responseHandler);

  /**
   * Обработчик ответа Reddit
   * @param {object} response Ответ Reddit'a
   */
  async function responseHandler(response) {
    const {
      data: { children },
    } = response;
    let filteredRecords = filterAllowContent(prepareRecords(children));
    checkCorrectImages(filteredRecords, sendFilteredRecords);
  }

  /**
   * Отправить сообщения в телеграм
   * @param {Array} records
   */
  async function sendFilteredRecords(records) {
    const fridayMessages = getPartsMessage(
      records.filter((record) => record.correct)
    );
    for (group of fridayMessages) {
      if (group.length > 1) {
        try {
          await telegram.sendMediaGroup(chatId, group, {
            disable_notification: true,
          });
        } catch (e) {
          console.error(e);
        }
      } else {
        const [photo] = group;
        telegram.sendPhoto(
          chatId,
          { url: photo.url },
          { caption: photo.title, disable_notification: true }
        );
      }
      await delay();
    }
    telegram.sendMessage(chatId, "Задача выполнена.");
  }
};

module.exports = friday;

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
