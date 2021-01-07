require("dotenv").config();
const { Telegraf } = require("telegraf");

const { isFriDay } = require("../lib/isFriDay");
const getConnection = require("../lib/db");
const commandParts = require("../lib/commandParts");

const friday = require("../commands/friday");
const { helpFriday } = require("../commands/help");
const start = require("../commands/start");
const whoami = require("../commands/whoami");

/**
 * Настройки для работы с MongoDB:
 * Если запись не найдена, то на команду update будет сделан insert
 */
const optionsUpdate = {
  new: true,
  upsert: true,
  setDefaultsOnInsert: true,
};
const bot = new Telegraf(process.env.TELEGRAM_TOKEN_FRIDAY, {
  webhookReply: process.env.NODE_ENV !== "development",
  telegram: { webhookReply: process.env.NODE_ENV !== "development" },
});
bot.catch((err, ctx) => {
  console.log(`Ooops, encountered an error for ${ctx.updateType}`, err);
});

bot.start(start);
bot.help(helpFriday);
bot.use(commandParts);

bot.on("message", async (ctx) => {
  const {
    state: {
      command: { text = "", command = "" },
    },
  } = ctx;
  const chatId = ctx.message.chat.id;

  // Обработка команды боту
  //--- Пятничная рассылка
  if (command === "friday") {
    const todayFriday = await isFriDay();
    return friday({ todayFriday, telegram: ctx.telegram, chatId });
  }
  //--- Подписка на пятницу
  if (command === "subscribe") {
    const conn = await getConnection();
    const Subscribe = conn.model("Subscribe");
    const query = { chatId, typeSubscribe: "friday" };
    await Subscribe.findOneAndUpdate(query, query, optionsUpdate);
    return ctx.telegram.sendMessage(chatId, "Задание принято.");
  }
  //--- Отписка от пятницы
  if (command === "unsubscribe") {
    const chatId = ctx.message.chat.id;
    const conn = await getConnection();
    const Subscribe = conn.model("Subscribe");
    try {
      await Subscribe.deleteMany({ chatId, typeSubscribe: "friday" });
      return ctx.telegram.sendMessage(
        chatId,
        `Хорошо, вычёркиваю ${ctx.from.username}`
      );
    } catch (e) {
      ctx.telegram.sendMessage(
        chatId,
        `Пятничный робот настигло сокрушительное фиаско :(
  ${e}`
      );
    }
  }
  //--- Покинуть чат
  if (command === "quit") {
    const chatId = ctx.message.chat.id;
    const conn = await getConnection();
    const Subscribe = conn.model("Subscribe");
    await Subscribe.deleteMany({ chatId, typeSubscribe: "friday" });
    ctx.telegram.leaveChat(ctx.message.chat.id);
    return ctx.leaveChat();
  }
  //--- Полезная информация о юзере
  if (command === "whoami") {
    return whoami(ctx);
  }
  return ctx.reply(text);
});

//--- Для локального запуска
if (process.env.NODE_ENV === "development") {
  bot.launch();
}

module.exports = {
  bot,
};
