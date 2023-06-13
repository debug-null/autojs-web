import { test } from "./action";
importPackage(Packages["okhttp3"]); //导入包

var globalWebsocket = null;
var client = new OkHttpClient.Builder().retryOnConnectionFailure(true).build();
// ws地址需要使用IP
var request = new Request.Builder().url("ws://10.161.118.66:8889/?deviceId=123456").build(); //vscode  插件的ip地址，
client.dispatcher().cancelAll(); //清理一次

var myListener = {
  onOpen: function (webSocket, response) {
    globalWebsocket = webSocket;
    //打开链接后，想服务器端发送一条消息
    var json = {};
    json.type = "hello";
    json.data = { device_name: "模拟设备", client_version: 123, app_version: 123, app_version_code: "233" };
    var hello = JSON.stringify(json);
    webSocket.send(hello);
  },
  onMessage: function (webSocket, msg) {
    //msg可能是字符串，也可能是byte数组，取决于服务器送的内容√
    try {
      process_msg(msg);
    } catch (error) {}
  },
  onClosing: function (webSocket, code, response) {
    print("正在关闭");
  },
  onClosed: function (webSocket, code, response) {
    print("已关闭");
  },
  onFailure: function (webSocket, t, response) {
    console.log("🚀 ~ file: main.ts:26 ~ t:", t);
    console.log("🚀 ~ file: main.ts:30 ~ myListener.response:", response);
    globalWebsocket = null;

    print("错误");
    print(t);
  }
};

var webSocket = client.newWebSocket(request, new WebSocketListener(myListener)); //创建链接

//接受处理消息
const process_msg = function (msgData) {
  console.log("🚀 ~ file: main.ts:47 ~ msgData:", msgData);
  var { type, data }: any = JSON.parse(msgData);
  switch (type) {
    case "hello":
      console.log(`服务器版本为： ${data.server_version}`);
      break;
    case "command":
      // 执行命令
      const { command, name, script } = data;
      console.log("🚀 ~ file: main.ts:56 ~ data:", data);
      engines.execScript(name, script);
      break;
    case "start":
      console.log("start");
      const { appname } = data;
      if (appname) {
        launchApp(appname);
      }
      break;
    case "task":
      test();
      break;
    default:
      break;
  }
};

setInterval(() => {
  // 防止主线程退出
}, 1000);

// 脚本退出时取消WebSocket
events.on("exit", () => {
  console.log("退出");
  client.dispatcher().cancelAll(); //清理一次
  client.connectionPool().evictAll(); //清理一次
  client.dispatcher().executorService().shutdown(); //清理一次
});
