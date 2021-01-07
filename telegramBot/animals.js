/* Этот бот ориентирован на выдачу фото о животных */
"use strict";
require("dotenv").config();
const { Telegraf } = require("telegraf");

const getConnection = require("../lib/db");
const commandParts = require("../lib/commandParts");

const { runWatch, stopWatch } = require("../commands/watch");
const randomPhoto = require("../commands/photo");
const help = require("../commands/help");
const start = require("../commands/start");
const whoami = require("../commands/whoami");

const bot = new Telegraf(process.env.TELEGRAM_TOKEN, {
  webhookReply: process.env.NODE_ENV === "development" ? false : true,
});

bot.start(start);
bot.help(help);
bot.action("delete", ({ deleteMessage }) => deleteMessage());
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
    return runWatch(ctx, "animals");
  }
  //--- Остановить таймер
  if (command === "stopWatch") {
    return stopWatch(ctx, "animals");
  }
  //--- Вывод фото, конечно же
  if (command === "photo") {
    return randomPhoto({ telegram: ctx.telegram, whatAnimal: args, chatId });
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
    await Watch.deleteMany({ chatId, typeWatch: "animals" });
    ctx.telegram.leaveChat(ctx.message.chat.id);
    return ctx.leaveChat();
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
