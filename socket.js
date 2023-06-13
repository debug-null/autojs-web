//引入需要用到的安卓包
importClass("java.net.InetAddress");
importClass("java.net.Inet6Address");
importClass("java.net.NetworkInterface");
importClass("java.net.InetSocketAddress");
importClass("java.net.DatagramPacket");
importClass("java.net.DatagramSocket");


// websocket全局对象,本地IP（用于终端验证）
let ws, localIP;
// 全局检测，ws服务端中断以后，需要重新自启组播服务，扫描服务用于子发现
let isConnect;


// 等待获取无障碍权限
auto.waitFor();

// 服务监控
let serverListenser = setInterval(function () {
    log("服务侦听…");
    initServer();
}, 3000);
// initServer();

//监听log事件,发送给服务端
events.broadcast.on("log", function (words) {
    try {
        if (!localIP) {
            localIP = getIntranetIP();
        }
        log(words);
        ws.send(JSON.stringify({ "type": "msg", "ip": localIP, "result": words }));
    } catch (err) {
        log(err);
    }
});


function initServer() {
    // 服务未连接
    if (isConnect != true) {
        // 临时暂停监听服务
        clearInterval(serverListenser);
        let ds = initDs();
        log("服务端发现…")
        while (true) {
            try {
                log("尝试通信…")
                // 发送组播消息，检测ws服务端口
                sendDs(ds, '255.255.255.255', 8061, JSON.stringify({ "type": "initAuto.js" }));
                // 等待消息响应
                let msg = getDsMsg(ds);
                log(msg);
                if (msg["msg"]["statues"] === "success") {
                    ds.close();
                    log("检测到服务，尝试链接…")
                    log("ws:/" + msg["ip"] + ":" + msg["msg"]["port"])
                    // 创建websocket链接
                    ws = initWs("ws:/" + msg["ip"] + ":" + msg["msg"]["port"] + "/worker");
                    // 服务器启动成功，更新标记位
                    isConnect = true;
                    log("链接成功！！")
                    // 重启监听服务
                    serverListenser = setInterval(function () {
                        initServer();
                    }, 3000);
                    break;
                }
            } catch (error) {
                log("未检测到服务…");
            }
        }
    }
}


// 创建组播
function initDs() {
    // 构造数据报套接字并将其绑定到本地主机上任何可用的端口
    log("初始化服务…")
    let ds = new DatagramSocket();
    ds.setBroadcast(true);
    return ds;
}

// 发送组播消息
function sendDs(ds, ip, port, msg) {
    ip = InetAddress.getByName(ip);
    let bts = new java.lang.String(msg).getBytes("UTF-8");
    ds.send(new DatagramPacket(bts, bts.length, ip, port));
}

// 接收组播消息
function getDsMsg(ds) {
    let bts = util.java.array('byte', 1024);
    let packet = new DatagramPacket(bts, bts.length);
    ds.setSoTimeout(2000);
    ds.receive(packet);
    return { "ip": packet.getAddress().toString(), "msg": JSON.parse(new java.lang.String(packet.getData(), 0, packet.getLength(), "UTF-8")) };
}
7
// 创建websocket
function initWs(url) {
    global
    let mClient = new OkHttpClient();
    let request = new Request.Builder().get().url(url).build();
    let globalWebsocket = null;

    mClient.newWebSocket(request, new JavaAdapter(WebSocketListener, {
        onOpen: function (webSocket, response) {
            globalWebsocket = webSocket;
        },
        onMessage: function (webSocket, text) {
            // 接收到消息后，这里转发到引擎执行脚本
            log("收到消息…");
            try {
                autojsHandle(text);
            } catch (error) {
                log(error);
                events.broadcast.emit('log', error + "");
            }

        },
        onClosed: function (webSocket, code, reason) {
            // 这里更新全局连接标记位，用于重新拉起服务检测
            isConnect = false;
            globalWebsocket = null;
            log("服务错误…");
            try {
                webSocket.close();
            } catch (error) {
                log(error);
            }
        },
        onFailure: function (webSocket, throwable, response) {
            isConnect = false;
            globalWebsocket = null;
            log("服务链接中断…");
            try {
                webSocket.close();
            } catch (error) {
                log(error);
            }
        }
    }));

    while (true) {
        try {
            if (globalWebsocket != null) {
                break;
            }
            sleep(1000)
        } catch (e) {
        }
    }
    return globalWebsocket;
}

function autojsHandle(text) {
    let msg = JSON.parse(text);
    // log(msg)
    // 所有的log都加上events.broadcast.emit("log",)来发送结果给websocket
    // msg["source"] = msg["source"].replace(/(log\(((?:['"]?).*\1)\)[;\n])/ig, "$1;events.broadcast.emit('log',$2);\n");
    msg["source"] = msg["source"].replace(/log\(/ig, "events.broadcast.emit(\"log\",");
    // log(msg);
    switch (msg["type"]) {
        case "main":
            eval(msg["source"]);
            break;
        default:
            engines.execScript(msg["title"], msg["source"], msg["config"]);
            break;
    }
}

function getIntranetIP() {
    // 获取所有网卡信息
    let networkInterfaces = NetworkInterface.getNetworkInterfaces();
    while (networkInterfaces.hasMoreElements()) {
        // 遍历网卡
        let networkInterface = networkInterfaces.nextElement();
        // 获取网卡地址
        let inetAddresses = networkInterface.getInetAddresses();
        while (inetAddresses.hasMoreElements()) {
            let inetAddress = inetAddresses.nextElement();
            // 判断网卡地址类型是不是IPV6，IPV6的舍弃
            if (inetAddress instanceof Inet6Address) {
                continue;
            }
            // 获取IP地址
            let ip = inetAddress.getHostAddress();
            // 非本地IP就绑定组播到网卡
            if (!"127.0.0.1".equals(ip)) {
                // 绑定网卡组播
                return ip;
            }
        }
    }
}