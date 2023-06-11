//引入ws模块
var {WebSocketServer } = require("ws");
//创建websocket服务，端口port为：****
const wss = new WebSocketServer({ port: 3000 });
//引入uuid模块ß
var uuid = require("uuid");

//定义一个空数组，存放客户端的信息
var clients = [];
var admin_clients = {};
function wsSend(type, client_uuid, nickname, message, clientcount) {
  //遍历客户端
  for (var i = 0; i < clients.length; i++) {
    //声明客户端
    var clientSocket = clients[i].ws;
    console.log("🚀 ~ file: socket.js:16 ~ wsSend ~ clientSocket:", clientSocket)
    // if (clientSocket.readyState === WebSocket.OPEN) {
      //客户端发送处理过的信息
      clientSocket.send(
        JSON.stringify({
          type: type,
          id: client_uuid,
          nickname: nickname,
          message: message,
          clientcount: clientcount
        })
      );
    // }
  }
}

//消息格式 {"type":"set_admin"}
// {"type":"dispatch_task","cmdtype":"task1"}

function wsSend2(message, target_client_uuid) {
  if (target_client_uuid != null) {
    if (admin_clients[target_client_uuid]) {
      console.log("下发给管理员");
    } else {
      console.log("下发给单个客户端");
    }

    //遍历客户端
    for (var i = 0; i < clients.length; i++) {
      //声明客户端
      var clientSocket = clients[i].ws;
      if (clientSocket.readyState === WebSocket.OPEN) {
        //指定客户端 发送处理过的信息
        if (target_client_uuid == clients[i].id) {
          clientSocket.send(JSON.stringify(message));
        }
      }
    }
  } else {
    console.log("下发任务给所有客户端");
    //遍历客户端
    for (var i = 0; i < clients.length; i++) {
      //声明客户端
      var clientSocket = clients[i].ws;
      if (clientSocket.readyState === WebSocket.OPEN) {
        //客户端发送处理过的信息
        clientSocket.send(JSON.stringify(message));
      }
    }
  }
}

//声明客户端index默认为1
var clientIndex = 1;
//服务端连接
wss.on("connection", function (ws) {

  //客户端client_uuid随机生成
  var client_uuid = uuid.v4();
  //昵称为游客+客户端index
  var nickname = "客户端" + clientIndex;
  //client++
  clientIndex += 1;
  //将新连接的客户端push到clients数组中
  clients.push({ id: client_uuid, ws: ws, nickname: nickname });
  //控制台打印连接的client_uuid
  console.log("client [%s] connected", client_uuid, "当前客户端数量：", clients.length);
  //声明连接信息为 昵称+来了
  // var connect_message = nickname + " 来了";
  var connect_message = " 来了";

  //服务器广播信息 ***来了
  //wsSend("notification", client_uuid, nickname, connect_message, clients.length);

  //当用户发送消息时
  ws.on("message", function (message) {
    var message = ArrayBufferUTF8ToStr(message);
    message = JSON.parse(message);
    console.log("s<=== ", message);

    // 用户输入"/nick"的话为重命名消息
    if (message.type.indexOf("/nick") === 0) {
      var nickname_array = message.split(" ");
      if (nickname_array.length >= 2) {
        var old_nickname = nickname;
        nickname = nickname_array[1];
        var nickname_message = "用户 " + old_nickname + " 改名为： " + nickname;
        wsSend("nick_update", client_uuid, nickname, nickname_message, clients.length);
      }
    }

    if (message.type == "set_admin") {
      console.log("设置客户端 ", client_uuid, " 为管理员");
      admin_clients[client_uuid] = 1;
      wsSend2(message, client_uuid);
    }

    if (message.type == "dispatch_task") {
      if (admin_clients[client_uuid]) {
        message.type = message.cmdtype;
        wsSend2(message);
      } else {
        console.log("没有权限，不是管理端");
      }
    }

    if (message.type == "ping") {
      message.type = "pong";
      wsSend2(message, client_uuid);
    }

    //发送消息
    else {
      //记录log
      //wsSend("message", client_uuid, nickname, message, clients.length);
    }
  });

  //关闭socket连接时
  var closeSocket = function (customMessage) {
    //遍历客户端
    for (var i = 0; i < clients.length; i++) {
      //如果客户端存在
      if (clients[i].id == client_uuid) {
        // 声明离开信息
        var disconnect_message;
        if (customMessage) {
          disconnect_message = customMessage;
        } else {
          disconnect_message = nickname + " 走了";
        }
        //客户端数组中删掉
        clients.splice(i, 1);
        //服务广播消息
        //wsSend("notification", client_uuid, nickname, disconnect_message, clients.length);
      }
    }
    console.log(client_uuid + "，已关闭，剩余客户端：" + clients.length);
  };

  ws.on("close", function () {
    closeSocket();
  });

  process.on("SIGINT", function () {
    console.log("Closing things");
    closeSocket("Server has disconnected");
    process.exit();
  });
});

function ArrayBufferUTF8ToStr(array) {
  var out, i, len, c;
  var char2, char3;
  if (array instanceof ArrayBuffer) {
    array = new Uint8Array(array);
  }

  out = "";
  len = array.length;
  i = 0;
  while (i < len) {
    c = array[i++];
    switch (c >> 4) {
      case 0:
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
        // 0xxxxxxx
        out += String.fromCharCode(c);
        break;
      case 12:
      case 13:
        // 110x xxxx   10xx xxxx
        char2 = array[i++];
        out += String.fromCharCode(((c & 0x1f) << 6) | (char2 & 0x3f));
        break;
      case 14:
        // 1110 xxxx  10xx xxxx  10xx xxxx
        char2 = array[i++];
        char3 = array[i++];
        out += String.fromCharCode(((c & 0x0f) << 12) | ((char2 & 0x3f) << 6) | ((char3 & 0x3f) << 0));
        break;
    }
  }

  return out;
}
