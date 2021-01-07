const mongoose = require("mongoose");

const watchSchema = require("../schema/watch");
const subscribeSchema = require("../schema/subscribe");

let conn = null;

module.exports = getConnection = async () => {
  if (conn == null) {
    conn = mongoose.createConnection(process.env.MONGO_CONNECT_URI, {
      bufferCommands: false,
      bufferMaxEntries: 0,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    await conn;
    conn.model("Watch", watchSchema);
    conn.model("Subscribe", subscribeSchema);
  }
  return conn;
};
