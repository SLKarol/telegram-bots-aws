# Телеграмм-боты

## animal.js

Показывает случайное фото животных. Можно подписаться на рассылку фото.

## friday.js

Показывает подборку фото из раздела nsfw. Можно подписаться на рассылку, которая выходит по пятницам.

## quotes.js

Показывает случайную цитату отцов церкви. Можно подписаться на рассылку.

Для работы нужно подготовить файл .env c такими значениями:

TELEGRAM_TOKEN="Токен бота для animal.js"

TELEGRAM_TOKEN_FRIDAY="Токен бота для friday.js"

TELEGRAM_TOKEN_QUOTES_FATHERS="Токен бота для quotes.js"

REDDIT_USER_NAME="RedditUserName"

REDDIT_PASSWORD="RedditPassword"

REDDIT_APP_ID="RedditAppId"

REDDIT_API_SECRET="RedditApiSecret"

MONGO_CONNECT_URI="MongoConnectUri"

Здесь REDDIT\_...настройки для подключения к Reddit и MONGO_CONNECT_URI - подключение к БД Mongo для хранения настроек подписки.

## AWS

Вторая важная часть этого проекта- развертывание его на амазоне (AWS). Для этого сделаны файлы handler.js и serverless.yml .

## scripts

Скрипты для запуска:

- **npm tun deploy** опубликовать на амазоне
- **npm tun logs** показать логи пятничного бота
- **npm run dev-bot** запустить пятничный бот локально (естественно, нужно остановить веб-хуки и прочие операции выполнить)
- **npm run local** запустить handler.js локально

Больше о разработке ботов можно узнать [здесь](https://dev.to/slkarol/series/10480) .
Как показала практика, после того, как бот развёрнут на амазоне, он не может корректно отправить в групповой чат альбомы. Возникают ошибки в телеграмм-библиотеке и отправка повторяется снова и снова. Как это решить я не знаю. Пока остановился на том, что бот без ошибок работает в обычном чате, не в групповом.
