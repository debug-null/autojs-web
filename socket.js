

importPackage(Packages["okhttp3"]); //导入包
var mClient = new OkHttpClient.Builder().retryOnConnectionFailure(true).build();
var request = new Request.Builder().url("ws://localhost:3300?name=第二台").build(); 
mClient.dispatcher().cancelAll();//清理一次

var globalWebsocket = null;
function init() {
    mClient.newWebSocket(request, new JavaAdapter(WebSocketListener, {
        onOpen: function (webSocket, response) {
            globalWebsocket=webSocket;
            console.log("开启连接成功")
        },
        onMessage: function (webSocket, text) {
            console.log("c<===="+text);
            process_msg(text)
        },
        onClosed: function (webSocket, code,reason) {
           console.log("onclose")
        },   
        onFailure: function (webSocket, throwable,response) {
            console.log("onFailure")
            console.log(webSocket, throwable,response)
        },
    }));
}

//接受处理消息
function process_msg(data){
    var msg = JSON.parse(data);
    //console.log("type:"+msg.type)
    var runflag = false
    var runlog
    var retunflag = true
    switch (msg.type) {
        case 'notification':
            retunflag = false
            break;
        
        case 'pong':
            retunflag = false
            break;

        case 'start':
            console.log("start")
            var appname = msg.appname
            var packagename = msg.appname
            if(appname){
                launchApp(appname)
            }else{
                launchPackage(packagename)
            }
            runflag = true
            break;

        case 'task1':

            console.log("执行task1，成功")
            runflag = true
            break;

        case 'task2':
            console.log("执行task2，失败")
            runflag = false
            runlog = "task2 can't xxx"
            break;

        case 'remote':
            var taskcode = msg.taskcode;
            var taskname = msg.taskname;
            engines.execScript(taskname, taskcode);
            runflag = true
            break;

        default:
            runflag = false
            runlog = "unknow type"
            break;
    }

    if(runflag){
        msg.ret="success"
    }else{
        msg.ret="fail"
        msg.log=runlog
    }
    if(retunflag){send_msg(msg)}
}

function send_msg(data){
    if(globalWebsocket==null){
        console.log("连接为空..")
        return
    }
    
    console.log("c===>")
    var success = globalWebsocket.send(JSON.stringify(data))
    if(!success){
        console.log("发送失败")
    }
    return success
}

function run(){
    try{
        if(globalWebsocket==null){
            init();
            sleep(500)
        }
        let success=globalWebsocket.send(JSON.stringify({"type":"ping"}))
        if(!success){
            init();
        }
        sleep(1000)
    }catch(e){
        console.log(e)
    }
}

//发送心跳
threads.start(function(){
    setInterval(() => {
        globalWebsocket.send(JSON.stringify({"type":"ping"}))
    }, 30*1000);
})

run()
// 脚本退出时取消WebSocket
events.on('exit', () => {
    console.log("退出");
    globalWebsocket.close()
});