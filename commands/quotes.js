const { quoteFathers } = require("../lib/quoteFathers");

/**
 * Отправить случайное фото животинки забавной
 * @param {Object} prop
 * @param {Object} prop.telegram
 * @param {number} prop.chatId
 */
const randomQuote = async ({ telegram, chatId }) => {
  telegram.sendMessage(chatId, "Ищу цитату ...");
  const cite = await quoteFathers();
  // Предусмотрительно защититься от null, который может внезапно прийти из апи (увы, да)
  if (!cite) {
    return telegram.sendMessage(chatId, "Поиск цитаты не удался");
  }
  return telegram.sendMessage(
    chatId,
    `*${cite.category}*
${cite.quote}
_${cite.otec}_`,
    { parse_mode: "Markdown" }
  );
};

module.exports = randomQuote;
