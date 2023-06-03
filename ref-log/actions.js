auto.waitFor();
importClass(android.content.Intent);
importClass(android.net.Uri);

var fns = {
    // 检测是否安装微信
  checkIsWx() {
    var packageName = "com.tencent.mm";
    var isWechatInstalled = app.getAppName(packageName);
    if (isWechatInstalled) {
      return true;
    } else {
      return false;
    }
  },
  // 删除download文件夹下的图片文件
  delDown() {
    try {
      var downPath = files.join(files.getSdcardPath(), "Download");
      var fileList = files.listDir(downPath);
      // 遍历文件，删除图片
      fileList
        .filter(function (file) {
          return file.endsWith(".jpg") || file.endsWith(".png");
        })
        .forEach(function (name) {
          var imgeFile = files.join(downPath, name);
          files.remove(imgeFile);
        });

      var msg = "已删除download文件夹下的图片文件";
      return errorFn(true, msg);
    } catch (error) {
      return errorFn(false, error);
    }
  },
  /**
   * 将二维码图片保存到download文件夹下
   */
  getQrSave() {
    try {
      var downPath = files.join(files.getSdcardPath(), "Download", "hotel-qr.jpg");
      var res = http.get("https://picb.zhimg.com/v2-8bd693cc12eeb749ba0ae5fb3062d5f9_b.png"); // 发送http请求
      var imgBytes = res.body.bytes(); // 获取byte类型的图片数据
      files.writeBytes(downPath, imgBytes); // 将图片数据保存到文件中

      //把图片加入相册
      media.scanFile(downPath);

      var msg = "图片已保存到：" + downPath;
      return errorFn(true, msg);
    } catch (error) {
      return errorFn(false, error);
    }
  },

  /**
   * 打开微信-扫一扫
   * @returns  {boolean} true-成功；false-失败
   */
  openWxSys: function () {
    // if (!this.delDown().status) return false;
    // if (!this.getQrSave().status) return false;

    try {
      toast("正在打开微信扫一扫…");
      //利用Intent打开微信
      app.startActivity({
        action: "VIEW",
        packageName: "com.tencent.mm",
        className: "com.tencent.mm.ui.LauncherUI",
        extras: {
          "LauncherUI.From.Scaner.Shortcut": true
        }
      });
      sleep(3000);
      while (!click("相册"));

      toast("默认选择第一张照片");
      sleep(3000);
      var oneX = className("android.widget.RelativeLayout").find()[1].bounds().centerX();
      var oneY = className("android.widget.RelativeLayout").find()[1].bounds().centerY();

      var isClickSuccess = click(oneX, oneY);

      var msg = "第一张照片，已成功选择";
      return errorFn(isClickSuccess, msg);
    } catch (e) {
      console.log("🚀 ~ file: actions.js:89 ~ e:", e)
      return errorFn(false, e);
    }
  },

  /**
   * 打开微信小程序（只能打开已打开的微信小程序）
   */
  openWxXcx: ()=>{
    var packageName = "com.tencent.mm";
    var launchActivity = "com.tencent.mm.plugin.appbrand.ui.AppBrandUI";
    // 使用 adb 命令启动微信小程序
    shell("am start -n " + packageName + "/" + launchActivity, true);
  }
};

function errorFn(status, msg) {
  toast(msg);
  // exit();
  return {
    status,
    msg
  };
}
module.exports = fns;

// // 删除download文件夹下的图片文件
// function delDown() {
//   var downPath = files.join(files.getSdcardPath(), "Download");
//   var fileList = files.listDir(downPath);

//   // 遍历文件，删除图片
//   fileList
//     .filter(function (file) {
//       return file.endsWith(".jpg") || file.endsWith(".png");
//     })
//     .forEach(function (name) {
//       var imgeFile = files.join(downPath, name);
//       console.log("🚀 ~ 删除图片文件 ==》", imgeFile);
//       files.remove(imgeFile);
//     });
// }

// // 将网络图片保存到download文件夹下
// function saveQr() {
//   var downPath = files.join(files.getSdcardPath(), "Download", "hotel-qr.jpg");
//   var res = http.get("https://picb.zhimg.com/v2-8bd693cc12eeb749ba0ae5fb3062d5f9_b.png"); // 发送http请求
//   var imgBytes = res.body.bytes(); // 获取byte类型的图片数据
//   files.writeBytes(downPath, imgBytes); // 将图片数据保存到文件中
//   log("图片已保存到：" + downPath);
// }

// function adbRecord() {
//   //adb 录屏
//   const IS_ROOT = files.exists("/sbin/su") || files.exists("/system/xbin/su") || files.exists("/system/bin/su");
//   if (!IS_ROOT) {
//     toast("没有root权限，无法执行");
//     exit;
//   }

//   // 推流： https://shu1shu2.com/article/2022/4/22/38.html
//   // adb -s 9305ac03 shell screenrecord --bit-rate 8000000 --size 1280x720 --time-limit 30 /sdcard/download/demo.mp4 --verbose
//   // https://blog.csdn.net/shenfengchen/article/details/111364422
//   var resolute = "1280x720";
//   var timeLimit = 30; // 录制时间
//   var savePath = "/sdcard/download/demoddd222.mp4"; // 保存路径
//   var bitRate = "8000000";
//   var cmd = `screenrecord --bit-rate ${bitRate} --size ${resolute} --time-limit ${timeLimit} ${savePath}`;
//   try {
//     var result = shell(cmd, true); //第二个参数： 是否以root权限运行，默认为false。
//     if (result.code == 0) {
//       sleep(3000);
//       var killCmd = "pkill -l SIGINT -f screenrecord"; // 停止录屏的命令
//       shell(killCmd, true); // 异步执行命令
//       toast("录屏结束，保存在Download目录");
//     } else {
//       toast("执行失败~: " + result.error);
//     }
//   } catch (error) {
//     log(error);
//   }
// }
