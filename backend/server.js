const app = require("express")();
const cors = require("cors");
const redis = require("socket.io-redis");
const { chat } = require("./src/chat");
const { rtcToken } = require("./src/rtc");

app.use(cors());
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: {},
});
io.adapter(
  redis({
    host: process.env.REDIS_SERVER,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
  })
);

app.get("/rtcToken", rtcToken);
io.on("connection", (socket) => chat(socket, io));


http.listen(process.env.PORT, () => {
  console.log(`app listening on port ${process.env.PORT}`);
});
