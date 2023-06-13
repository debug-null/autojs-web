const { WebSocketServer } = require("ws");
const WebSocket = require("ws");
const { EventEmitter } = require("events");
const getLogger = require("./utils/log4js").default;

const logger = getLogger("WebSocketManager");

const clientStatusChangeListeners = []; // 客户端状态
const clientMessageListeners = [];

class WebSocketManager extends EventEmitter {
  constructor(port = 3300) {
    super();

    this.devicesArr = new Map(); // 已连接的设备
    this.wss = new WebSocketServer({ port });
    this.setListeners();
  }

  init() {
    if (!this.instance) {
      this.instance = new WebSocketManager();
    }
    this.instance.ping();
    return this.instance;
  }

  //   获取实例
  getInstance() {
    if (!this.instance) {
      logger.info("this Not initialized!");
    }
    return this.instance;
  }
  //   获取设备信息
  getDevices() {
    return this.devicesArr;
  }

  // 设置需要监听的事件
  setListeners() {
    // websocker 连接事件
    this.wss.addListener("connection", this.onWebSocketConnection.bind(this));

    // websocker 错误事件
    this.wss.addListener("error", this.onWebSocketError.bind(this));
  }

  // 连接事件
  onWebSocketConnection(client, req) {
    const deviceId = new URLSearchParams(req.url.split("?")[1]).get("deviceId");
    console.log("🚀 ~ file: websocketManager.js:52 ~ WebSocketManager ~ onWebSocketConnection ~ deviceId:", deviceId)
    // 只要携带了deviceId 参数，就代表是可接入的设备
    if (deviceId) {
      client.deviceId = deviceId;
      // 存储客户端信息
      const cacheData = { deviceId, client };
      this.devicesArr.set(deviceId, cacheData);

      // 设备接入成功，发送通知
      this.sendMessage(client, { error: false, code: 200, message: "设备接入成功" });
    } else {
      console.error(`设备接入失败`);
      return;
    }

    client.ip = req.connection.remoteAddress || (req.headers["x-forwarded-for"] || "").split(/\s*,\s*/)[0];
    client.ip = client.ip.replace(/[^0-9\.]/gi, "");

    logger.info("WebSocket.Server connection client ip -> " + client.ip + " url -> " + req.url);

    client.addListener("close", (code, message) => {
      logger.info(`关闭scoker连接，code:${code},message:${message}`);
    });

    client.addListener("message", (data, isBinary) => {
      // 消息监听
      clientMessageListeners.forEach((listener) => {
        listener(client, data);
      });

      // 保活
      client.isAlive = true;
      client.addListener("pong", () => {
        console.log("pong----");
        client.isAlive = true;
      });
      // 保活
    });

    logger.info("WebSocket.Client open ip -> " + client.ip);
    clientStatusChangeListeners.forEach((listener) => {
      listener(client, "open");
    });
  }
  //   错误监听
  onWebSocketError(err) {
    console.error("🚀 ~ file: websocketManager.js:48 ~ WebSocketManager ~ this.wss.addListener ~ err:", err);
    logger.error("WebSocket.Server error -> " + err.message);
  }

  // 定时发送ping消息，检测客户端是否在线
  ping() {
    if (!this.pingTimeout) {
      this.pingTimeout = setInterval(() => {
        this.wss.clients.forEach((ws) => {
          // 终止死亡的连接
          if (ws.isAlive === false) return wx.terminate();
          // 标记客户端为死亡状态
          ws.isAlive = false;

          // 通过发送 Ping 帧来探测连接是否存活，以及计算往返时间（RTT
          ws.ping(() => {});
        });
      }, 3000);
    }
  }

  sendMessage(client, message, cb) {
    if (client.readyState === WebSocket.OPEN) {
      //   message.message_id = `${Date.now()}_${Math.random()}`;
      client.send(JSON.stringify(message), (err) => {
        if (err) {
          logger.error(`send message appear error, message -> ${err.message}`);
          cb(err);
        } else {
          //   messageAnswer.set(message.message_id, cb);
        }
      });
    }
  }

  // 广播
  broadcast(message) {
    for (const ws of this.wss.clients.values()) {
      this.sendMessage(ws, message);
    }
  }

  /**
   * 添加客户端消息监听器
   * @param listener
   */
  addClientMessageListener(listener) {
    clientMessageListeners.push(listener);
  }

  /**
   * 添加客户端状态变化监听器
   * @param listener
   */
  addClientStatusChangeListener(listener) {
    clientStatusChangeListeners.push(listener);
  }
}

module.exports = {
  WebSocketManager
};
