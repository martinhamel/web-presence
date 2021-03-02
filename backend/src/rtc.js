const twilio = require("twilio");

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_TOKEN;

const rtcToken = async (req, res) => {
  const client = twilio(accountSid, authToken);
  const token = await client.tokens.create();
  res.status(200).send(token);
};

module.exports = {
  rtcToken,
};
