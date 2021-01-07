const { getNewRecords, mapRedditForTelegram } = require("../lib/reddit");
const { delay } = require("../lib/common");

/**
 * Вывести все данные для пятничного выпуска
 * @param {Object} prop
 * @param {TelegrafContext} prop.telegram
 * @param {boolean} prop.todayFriday
 * @param {number} prop.chatId
 */
const friday = async ({ telegram, todayFriday, chatId }) => {
  // Надпись
  if (!todayFriday) {
    await telegram.sendMessage(
      chatId,
      "Ну, хоть сегодня и не пятница, немножко можно."
    );
  }
  await telegram.sendMessage(
    chatId,
    "Готовятся материалы для публикации в этом чате."
  );

  /**
   * Собранные выпуски.
   * Когда не-пятница, их вдвое меньше.
   */
  const friDay = await getNewRecords(todayFriday ? 20 : 10);

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
  //--- Примеры отправки сообщения
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
  // 3 example
  for (group of fridayMessages) {
    await delay();
    if (group.length > 1)
      await telegram.sendMediaGroup(chatId, group, {
        disable_notification: true,
      });
    else {
      const [photo] = group;
      telegram.sendPhoto(
        chatId,
        { url: photo.url },
        { caption: photo.title, disable_notification: true }
      );
    }
  }
  // 4 example
  // for (photo of friDay) {
  //   try {
  //     await telegram.sendPhoto(
  //       chatId,
  //       { url: photo.url },
  //       { caption: photo.title, disable_notification: true }
  //     );
  //     await delay(2000);
  //   } catch (e) {
  //     console.error(e);
  //   }
  // }
  // 5 example
  // for (photo of friDay) {
  //   try {
  //     await telegram.sendMessage(chatId, `${photo.title}\n${photo.url}`, {
  //       disable_notification: true,
  //       parse_mode: "Markdown",
  //     });
  //     await delay(900);
  //   } catch (e) {
  //     console.error(e);
  //   }
  // }
  // 6
  // for (group of fridayMessages) {
  //   // await delay();
  //   if (group.length > 1)
  //     await telegram.sendMediaGroup(chatId, group, {
  //       disable_notification: true,
  //     });
  //   else {
  //     const [photo] = group;
  //     telegram.sendPhoto(
  //       chatId,
  //       { url: photo.url },
  //       { caption: photo.title, disable_notification: true }
  //     );
  //   }
  // }
  telegram.sendMessage(chatId, "Задача выполнена.");
};

module.exports = friday;
