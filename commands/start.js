const start = (ctx) =>
  ctx.reply(
    `Приветствую, ${
      ctx.from.first_name ? ctx.from.first_name : "хороший человек"
    }! Набери /help и увидишь, что я могу.`
  );

module.exports = start;
