importPackage(Packages["okhttp3"]); //导入包
var client = new OkHttpClient.Builder().retryOnConnectionFailure(true).build();
var request = new Request.Builder().url("ws://192.168.2.194:7002/socket.io/?EIO=3&transport=websocket").build(); //vscode  插件的ip地址，
client.dispatcher().cancelAll(); //清理一次

//创建链接
var webSocket = client.newWebSocket(
  request,
  new WebSocketListener({
    onOpen: function (webSocket, response) {
      print("onOpen");
    },
    onMessage: function (webSocket, msg) {
      try {
    console.log("🚀 ~ file: websocket.js:33 ~ msg:", msg)

        // var obj = JSON.parse(msg);
        // console.log("🚀 ~ file: websocket.js:14 ~ obj:", obj);
      } catch (error) {
        console.log("🚀 ~ file: websocket.js:17 ~ error:", error);
      }
    },
    onClosing: function (webSocket, code, response) {
      print("正在关闭");
    },
    onClosed: function (webSocket, code, response) {
      print("已关闭");
    },
    onFailure: function (webSocket, t, response) {
      print("错误");
      print(t);
      exit();
    }
  })
); 

webSocket.send('init')

// 设置定时器, 目的是不让脚本停止
setInterval(function () {}, 1000);
