require("dotenv").config();
const { Telegraf } = require("telegraf");

const { isFriDay } = require("../lib/isFriDay");
const getConnection = require("../lib/db");
const commandParts = require("../lib/commandParts");
const { delay } = require("../lib/common");
const getFridayContent = require("../lib/reddit");

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
const bot = new Telegraf(
  process.env.NODE_ENV !== "development"
    ? process.env.TELEGRAM_TOKEN_FRIDAY
    : process.env.TELEGRAM_TOKEN_DEV,
  {
    webhookReply: process.env.NODE_ENV !== "development",
    telegram: { webhookReply: process.env.NODE_ENV !== "development" },
  }
);
bot.catch((err, ctx) => {
  console.log(`Ooops, encountered an error for ${ctx.updateType}`, err);
});

bot.start(start);
bot.help(helpFriday);
bot.use(commandParts);

bot.on("message", async (ctx) => {
  const {
    state: {
      command: { text = "", command = "", args = "" },
    },
  } = ctx;
  const chatId = ctx.message.chat.id;
  // Обработка команды боту
  //--- Пятничная рассылка
  if (command === "friday") {
    const todayFriday = await isFriDay();
    // Надпись о начале работы
    await ctx.telegram.sendMessage(
      chatId,
      "Готовятся материалы для публикации в этом чате."
    );
    try {
      // Получить массив сообщений для пятничного контента
      const fridayMessages = await getFridayContent({
        todayFriday,
        group: args,
      });
      for (group of fridayMessages) {
        // Если это альбом, то отправить альбом ...
        if (group.length > 1) {
          try {
            await ctx.telegram.sendMediaGroup(chatId, group, {
              disable_notification: true,
            });
          } catch (e) {
            console.error(e);
          }
        } else {
          // Если это всего лишь одно фото, то отправить одно фото
          const [photo] = group;
          ctx.telegram.sendPhoto(
            chatId,
            { url: photo.url },
            { caption: photo.title, disable_notification: true }
          );
        }
        await delay();
      }
      return ctx.telegram.sendMessage(chatId, "Задача выполнена.");
    } catch (error) {
      console.error(error);
      return ctx.telegram.sendMessage(
        chatId,
        "Увы, произошла ошибка доступа к контенту."
      );
    }
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
