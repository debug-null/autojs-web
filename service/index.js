"use strict";

const session = require("express-session");
const express = require("express");
const http = require("http");
const uuid = require("uuid");

const { WebSocketManager } = require("./websocketManager.js");
WebSocketManager.prototype.init();

const websockerInstance = WebSocketManager.prototype.getInstance();

websockerInstance.addClientStatusChangeListener((client, status) => {
  if (status === "open") {
    websockerInstance.sendMessage(client, {
      type: "hello",
      data: { deviceId: client.deviceId }
    });
  }
});

websockerInstance.addClientMessageListener((client, data) => {
  console.log("🚀 ~ file: index.js:16 ~ WebSocketManager.prototype.getInstance ~ client:", client);
  try {
    const messageObj = JSON.parse(data);
    const action = messageObj.action;

    if (action == "register") {
      // 注册设备
      const { deviceId } = messageObj.data;
      if (!deviceId) {
        ws.send(sendMsg({ code: 400, message: "deviceId 不能为空" }));
        return;
      }
    }

    if (action == "broadCase") {
      // 触发消息广播
      websockerInstance.broadcast("我是广播消息");
    }
  } catch (error) {
    console.error("🚀 ~ file: index.js:89 ~ error:", error);
    console.log(`从用户  接收到消息 ${data}`);
  }
});

const app = express();
const mapSocket = new Map();

const sessionParser = session({
  saveUninitialized: false,
  secret: "$eCuRiTy",
  resave: false
});

app.use(express.static(__dirname + "/public"));
app.use(sessionParser);

app.post("/login", function (req, res) {
  const id = uuid.v4();

  console.log(`更新用户 ${id} 的会话`);
  req.session.userId = id;
  res.send({ result: "OK", message: "会话已更新" });
});

app.delete("/logout", function (request, response) {
  const ws = mapSocket.get(request.session.userId);

  console.log("销毁会话");
  request.session.destroy(function () {
    if (ws) ws.close();

    response.send({ result: "OK", message: "会话已销毁" });
  });
});

const server = http.createServer(app);
server.listen(8090, function () {
  console.log("正在监听 http://localhost:8090");
});

const sendMsg = (data = {}, type = "json") => {
  return JSON.stringify({
    type,
    data
  });
};
