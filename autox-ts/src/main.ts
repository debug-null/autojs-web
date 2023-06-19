import { checkAccessibility } from "./action";
checkAccessibility("auto");

if (!auto.service) {
  toast("请打开无障碍服务");
  auto.waitFor(); //等待用户开启无障碍，并返回
}

importPackage(Packages["okhttp3"]); //导入包

var globalWebsocket: any = null;
const client = new OkHttpClient.Builder().retryOnConnectionFailure(true).build();
// ws地址需要使用IP
const request = new Request.Builder().url("ws://10.161.118.80:8889/?deviceId=123456").build(); //vscode  插件的ip地址，
client.dispatcher().cancelAll(); //清理一次

const myListener = {
  onOpen: function (webSocket, response) {
    webSocket.send(logFn("websocket 连接成功"));
    globalWebsocket = webSocket;
    // setInterval(() => {
    //   webSocket.send(logFn('普通消息'));
    //   webSocket.send(logFn('错误消息', 'error'));
    // }, 3000);
  },
  onMessage: function (webSocket, msg) {
    webSocket.send(logFn("接收到socker消息"));
    //msg可能是字符串，也可能是byte数组，取决于服务器送的内容√
    try {
      process_msg(msg);
    } catch (error) {
      webSocket.send(logFn(`异常：${error}`, "error"));
    }
  },
  onClosing: function (webSocket, code, response) {
    webSocket.send(logFn("websocket 正在关闭"));
  },
  onClosed: function (webSocket, code, response) {
    webSocket.send(logFn("websocket 已关闭"));
  },
  onFailure: function (webSocket, t, response) {
    webSocket.send(logFn(`websocket 异常: ${t}`));
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
      const { name, script } = data;  

      const enginesArgs = {name, 'test': '史燕斌'} // 给脚本传递的参数，脚本可在args中获取
      const myEngines = execScript(name, script, enginesArgs );

      var thread = threads.start(function () {
        // 判断引擎是否结束
        var timer = setInterval(() => {
          console.log("🚀 ~ file: main.ts:78 ~ myEngines.getEngine():", myEngines.getEngine());

          const isEngDone = myEngines.getEngine().isDestroyed();
          if (isEngDone && globalWebsocket) {
            globalWebsocket.send(logFn(`${name}-脚本执行结束`, "warn"));
            clearInterval(timer);
            //停止线程执行
            thread.interrupt();
          }
        }, 1000);
      });

      break;
    case "hotel-record":
      // 接收图片
      const { qrImg } = data;
      var downPath = files.join(files.getSdcardPath(), "Download", "hotel-qr2.jpg");

      var tempImg = images.fromBase64(qrImg);
      var isSave = images.save(tempImg, downPath, "jpg", 100) as any;
      if (isSave) {
        toast("保存成功");
      } else {
        toast("保存失败");
      }

      break;
    case "task":
      break;
    default:
      break;
  }
};

// 日志方法
const logFn = (msg, level = "") => {
  console.log("🚀 ~ file: main.ts:82 ~ logFn ~ msg:", msg);
  const _levelObj = {
    verbose: "",
    debug: "D",
    info: "I",
    warn: "W",
    error: "E"
  };
  return JSON.stringify({
    type: "log",
    data: {
      log: `/${_levelObj[level] || ""}: ${JSON.stringify(msg)}`
    }
  });
};


// 执行脚本
const execScript = (name, action, args = {}) => {
  const interParams = `var args = ${JSON.stringify(args)};`; //给脚本传递的参数，脚本可在args中获取
  const script =interParams + action.toString();
  return engines.execScript(name, script);
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
