const { bot: animalBot } = require("./telegramBot/animals");
const { bot: fridayBot } = require("./telegramBot/friday");
const { bot: quoteBot } = require("./telegramBot/quotes");
const { getResponseHeaders, createHook } = require("./lib/common");
const scheduleRate = require("./controllers/scheduleRate");
const sendFriday = require("./controllers/sendFriday");

/**
 * Вебхук для бота фото
 */
module.exports.hello = async (event, context) =>
  await createHook(event, context, animalBot);

/**
 * Устновка веб-хуков.
 * Если вызвать этот метод, то хуки вступят в силу
 */
module.exports.setWebhook = async (event) => {
  const urlAnimal = `https://${event.headers.Host}/${event.requestContext.stage}/webhook`;
  const urlFriday = `https://${event.headers.Host}/${event.requestContext.stage}/webhookFriday`;
  const urlQuotes = `https://${event.headers.Host}/${event.requestContext.stage}/quotes`;

  try {
    await Promise.all([
      animalBot.telegram.setWebhook(urlAnimal),
      fridayBot.telegram.setWebhook(urlFriday),
      quoteBot.telegram.setWebhook(urlQuotes),
    ]);
    return {
      statusCode: 200,
      headers: getResponseHeaders(),
      body: JSON.stringify({ urlAnimal, urlFriday, urlQuotes }),
    };
  } catch (err) {
    return {
      statusCode: err.statusCode ? err.statusCode : 500,
      headers: getResponseHeaders(),
      body: JSON.stringify({
        error: err.name ? err.name : "Exception",
        message: err.message ? err.message : "Unknown error",
      }),
    };
  }
};

/**
 * В заданный интервал отправляет сообщение
 */
module.exports.afterTimeout = async (event, context) => {
  try {
    const re = await scheduleRate();
    return {
      statusCode: 200,
      headers: getResponseHeaders(),
      body: JSON.stringify(re),
    };
  } catch (err) {
    return {
      statusCode: err.statusCode ? err.statusCode : 500,
      headers: getResponseHeaders(),
      body: JSON.stringify({
        error: err.name ? err.name : "Exception",
        message: err.message ? err.message : "Unknown error",
      }),
    };
  }
};

/**
 * Вебхук для бота пятницы
 */
module.exports.fridayHook = async (event, context) =>
  await createHook(event, context, fridayBot);

/**
 * В заданный интервал отправляет сообщение
 */
module.exports.sendFriday = async (event, context) => {
  try {
    const re = await sendFriday();
    return {
      statusCode: 200,
      headers: getResponseHeaders(),
      body: JSON.stringify(re),
    };
  } catch (err) {
    return {
      statusCode: err.statusCode ? err.statusCode : 500,
      headers: getResponseHeaders(),
      body: JSON.stringify({
        error: err.name ? err.name : "Exception",
        message: err.message ? err.message : "Unknown error",
      }),
    };
  }
};

/**
 * Вебхук для бота цитат
 */
module.exports.quotes = async (event, context) =>
  await createHook(event, context, quoteBot);
