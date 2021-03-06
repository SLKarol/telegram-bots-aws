const probe = require("probe-image-size");

const getResponseHeaders = () => {
  return {
    "Access-Control-Allow-Origin": "*",
  };
};
exports.getResponseHeaders = getResponseHeaders;

/**
 * Разбор строки вида 30m | 1h | 7d
 * @param {string} period
 */
const parseStringPeriod = (period) => {
  const tmp = period.toLowerCase();
  let partsString = [];
  if (tmp.indexOf("m") > -1) {
    return { type: "m", value: +tmp.split("m")[0] };
  }
  if (tmp.indexOf("h") > -1) {
    return { type: "h", value: +tmp.split("h")[0] };
  }
  if (tmp.indexOf("d") > -1) {
    return { type: "d", value: +tmp.split("d")[0] };
  }
  return { value: 0, type: "error" };
};

/**
 * Получить значение таймаута
 * @param {string} periodString строка вида вида 30m | 1h | 7d
 */
exports.takeTimeOutValue = (periodString) => {
  const userSetting = parseStringPeriod(periodString);
  if (userSetting.type === "error") {
    return false;
  }
  if (userSetting.type === "m") {
    return userSetting.value * 60000;
  }
  if (userSetting.type === "h") {
    return userSetting.value * 3600000;
  }
  if (userSetting.type === "d") {
    return userSetting.value * 86400000;
  }
  return false;
};

/**
 * Установить задержку, вернуть промис
 */
exports.delay = (ms = 1000) =>
  new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });

exports.createHook = async (event, context, bot) => {
  // Доп. опция, оптимально
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    let body =
      event.body[0] === "{"
        ? JSON.parse(event.body)
        : JSON.parse(Buffer.from(event.body, "base64"));
    await bot.handleUpdate(body);
    return { statusCode: 200, body: "" };
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
 * Проверка того, что можно отправить сообщение
 * @param {object} telegram
 * @param {number} chatId ID чата
 */
exports.canSendMessage = async (telegram, chatId) => {
  try {
    const info = await telegram.getChat(chatId);
    const {
      permissions: { can_send_messages = true },
    } = info;
    return can_send_messages;
  } catch (e) {
    return false;
  }
};

function gcd(a, b) {
  if (b > a) {
    temp = a;
    a = b;
    b = temp;
  }
  while (b != 0) {
    m = a % b;
    a = b;
    b = m;
  }
  return a;
}

/**
 * Расчёт соотношений ширины и высоты
 * @param {number} width
 * @param {number} height
 * @returns {string} 4:2 или 4:9 и т.д.
 */
function calculateRatio(width, height) {
  const c = gcd(width, height);
  return `${width / c}:${height / c}`;
}

/**
 * Соотношение корректное для отправки в телеграмм?
 * @param {number} width
 * @param {number} height
 * @returns {boolean} Соотношение корректное для отправки в телеграмм?
 */
const isCorrectRatio = (width, height) =>
  !calculateRatio(width, height)
    .split(":")
    .some((q) => q >= 20);

/**
 * Изображение годно к отправке в телеграмм?
 * @param {string} url Адрес изображения
 * @returns {boolean} Корректно для отправки
 */
exports.isCorrectImage = async (url) => {
  let re = false;
  try {
    const { width, height, length } = await probe(url);
    const sum = width + height;
    // todo
    // Добавить в условие проверку отношения: isCorrectRatio(width, height)
    if (sum < 10000 && length < 5e6) {
      re = true;
    }
  } catch (error) {
    console.error(error);
  }
  return re;
};
