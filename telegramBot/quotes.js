"use strict";
require("dotenv").config();
const { Telegraf } = require("telegraf");

const getConnection = require("../lib/db");
const commandParts = require("../lib/commandParts");

const { runWatch, stopWatch } = require("../commands/watch");
const { helpQuotes } = require("../commands/help");
const start = require("../commands/start");
const whoami = require("../commands/whoami");
const randomQuote = require("../commands/quotes");

const bot = new Telegraf(process.env.TELEGRAM_TOKEN_QUOTES_FATHERS, {
  webhookReply: process.env.NODE_ENV === "development" ? false : true,
});

bot.start(start);
bot.help(helpQuotes);
bot.use(commandParts);
bot.on("message", async (ctx) => {
  const {
    state: {
      command: { text = "", command = "", args = "" },
    },
  } = ctx;
  const chatId = ctx.message.chat.id;
  //--- Запустить таймер
  if (command === "watch") {
    return runWatch(ctx, "quotes");
  }
  //--- Остановить таймер
  if (command === "stopWatch") {
    return stopWatch(ctx, "quotes");
  }
  //--- Вывод цитаты
  if (command === "quote") {
    return randomQuote({ telegram: ctx.telegram, chatId });
  }
  //--- Полезная информация о юзере
  if (command === "whoami") {
    return whoami(ctx);
  }
  //--- Покинуть чат
  if (command === "quit") {
    const chatId = ctx.message.chat.id;
    const conn = await getConnection();
    const Watch = conn.model("Watch");
    await Watch.deleteMany({ chatId, typeWatch: "quotes" });

    ctx.telegram.leaveChat(ctx.message.chat.id);
    return ctx.leaveChat();
  }
});

//--- Для локального запуска
if (process.env.NODE_ENV === "development") {
  bot.launch();
}

module.exports = {
  bot,
};
