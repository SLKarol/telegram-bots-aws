const getConnection = require("../lib/db");

const { bot } = require("../telegramBot/animals");
const { bot: quoteBot } = require("../telegramBot/quotes");
const randomPhoto = require("../commands/photo");
const randomQuote = require("../commands/quotes");
const { delay, canSendMessage } = require("../lib/common");

/**
 * Проходит по заданным подпискам и отправляет сообщения
 */
const scheduleRate = async () => {
  const conn = await getConnection();
  const Watch = conn.model("Watch");
  const typesWatch = ["animals", "quotes"];
  let recordsSend = 0;
  // Пройтись по всем типам рассылок
  for (typeWatch of typesWatch) {
    // Собрать все задания, которые нужно выполнить
    const tasks = await Watch.find({
      calculateDate: { $lt: new Date().toISOString() },
      typeWatch,
    });
    recordsSend += tasks.length;
    const promiseArray = [];
    for (task of tasks) {
      const possibleSend = canSendMessage(bot.telegram, task.chatId);
      if (possibleSend) {
        if (typeWatch === "animals") {
          await randomPhoto({ telegram: bot.telegram, chatId: task.chatId });
        }
        if (typeWatch === "quotes") {
          await randomQuote({
            telegram: quoteBot.telegram,
            chatId: task.chatId,
          });
        }
        await delay();
        const calculateDate = new Date(new Date().getTime() + task.timeoutMS);
        promiseArray.push(
          Watch.updateOne({ _id: task._id }, { calculateDate })
        );
      }
    }
    await Promise.all(promiseArray);
  }
  return { recordsSend };
};

module.exports = scheduleRate;
