const fetch = require("node-fetch");

exports.quoteFathers = async () => {
  const response = await fetch(
    "https://svyatye.com/email/get/random/cita/json/"
  );
  const data = await response.json();
  return data;
};
