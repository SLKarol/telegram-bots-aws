const getConnection = require("../lib/db");
const { isFriDay } = require("../lib/isFriDay");
const { delay, canSendMessage } = require("../lib/common");

const { bot } = require("../telegramBot/friday");
const friday = require("../commands/friday");

/**
 * Задаёт интервал отслеживания за тем, что хочет пользователь
 */
const sendFriday = async () => {
  //--- Если не пятница сегодня, то и не надо ничего отправлять
  const todayFriday = await isFriDay();
  if (!todayFriday) {
    return { recordsSend: 0 };
  }
  //--- Подготовка к пятничной рассылке
  const conn = await getConnection();
  const Subscribe = conn.model("Subscribe");
  // Собрать все задания, которые нужно выполнить
  const tasks = await Subscribe.find({
    typeSubscribe: "friday",
  });
  const promiseArray = [];
  for (task of tasks) {
    const possibleSend = canSendMessage(bot.telegram, task.chatId);
    if (possibleSend) {
      promiseArray.push(
        friday({
          telegram: bot.telegram,
          chatId: task.chatId,
          todayFriday: true,
        })
      );
      await delay();
    }
  }
  await Promise.all(promiseArray);

  return { recordsSend: tasks.length };
};

module.exports = sendFriday;
