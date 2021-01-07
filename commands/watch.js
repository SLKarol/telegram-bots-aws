"use strict";

const { takeTimeOutValue } = require("../lib/common");
const getConnection = require("../lib/db");

const optionsUpdate = {
  // Return the document after updates are applied
  new: true,
  // Create a document if one isn't found. Required
  // for `setDefaultsOnInsert`
  upsert: true,
  setDefaultsOnInsert: true,
};

/**
 * Запуск задания на отслеживания часа икс
 */
exports.runWatch = async (ctx, typeWatch = "") => {
  const chatId = ctx.chat.id;
  // Определить, что запускать.
  const [, timeout = "24h"] = ctx.message.text.split(" ");
  const timeoutMS = takeTimeOutValue(timeout);
  if (!timeoutMS) {
    return ctx.telegram.sendMessage(
      chatId,
      "Простите, но я не смог разобрать настройки периода."
    );
  }
  if (timeoutMS < 1800000) {
    return ctx.telegram.sendMessage(
      chatId,
      "Минимальный период 30m, а у Вас введено меньше."
    );
  }
  // Поднять настройки подключения к бд
  const conn = await getConnection();
  const Watch = conn.model("Watch");
  // Или новое задание завести или обновить
  const query = { chatId, typeWatch };
  const calculateDate = new Date(new Date().getTime() + timeoutMS);
  try {
    await Watch.findOneAndUpdate(
      query,
      {
        timeoutMS,
        calculateDate: calculateDate.toISOString(),
      },
      optionsUpdate
    );
    return ctx.reply("Задание принято.");
  } catch (e) {
    ctx.telegram.sendMessage(
      chatId,
      `Телеграмм-бота постигло сокрушительное фиаско :(
${e}`
    );
  }
};

/**
 * Остановить отслеживание
 */
exports.stopWatch = async (ctx, typeWatch = "") => {
  const chatId = ctx.chat.id;
  // Поднять настройки подключения к бд
  const conn = await getConnection();
  const Watch = conn.model("Watch");
  await Watch.deleteOne({ chatId, typeWatch });
  return ctx.reply("Подписка отменена.");
};
