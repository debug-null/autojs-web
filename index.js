auto.waitFor();
importClass(android.content.Intent);
importClass(android.net.Uri);
toast("点我啦");

var fns = {
  // 检测是否安装微信
  checkIsWx() {
    var packageName = "com.tencent.mm";
    var isWechatInstalled = app.getAppName(packageName);
    console.log("🚀 ~ file: index.js:14 ~ checkIsWx ~ isWechatInstalled:", isWechatInstalled);
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
      var imgRes = http.get("https://picb.zhimg.com/v2-8bd693cc12eeb749ba0ae5fb3062d5f9_b.png"); // 发送http请求
      if (imgRes.statusCode != 200) return errorFn(false, "图片请求失败");
      var imgBytes = imgRes.body.bytes(); // 获取byte类型的图片数据
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

      toast("选择第一张照片");
      sleep(3000);
      var oneX = className("android.widget.RelativeLayout").find()[1].bounds().centerX();
      var oneY = className("android.widget.RelativeLayout").find()[1].bounds().centerY();

      var isClickSuccess = click(oneX, oneY);
      console.log("🚀 ~ file: index.js:85 ~ isClickSuccess:", isClickSuccess);
      if (isClickSuccess) {
        var msg = "第一张照片，已成功选择";
        return errorFn(isClickSuccess, msg);
      } else {
        var msg = "第一张照片，选择失败";
        return errorFn(isClickSuccess, msg);
      }
    } catch (e) {
      console.log("🚀 ~ file: actions.js:89 ~ e:", e);
      return errorFn(false, e);
    }
  },

  /**
   * 打开微信小程序（只能打开已打开的微信小程序）
   */
  openWxXcx: () => {
    var packageName = "com.tencent.mm";
    var launchActivity = "com.tencent.mm.plugin.appbrand.ui.AppBrandUI";
    // 使用 adb 命令启动微信小程序
    shell("am start -n " + packageName + "/" + launchActivity, true);
  },

  //   模拟随机滑动
  sml_move(qx, qy, zx, zy, time) {
    var xxy = [time];
    var point = [];
    var dx0 = {
      x: qx,
      y: qy
    };

    var dx1 = {
      x: random(qx - 100, qx + 100),
      y: random(qy, qy + 50)
    };
    var dx2 = {
      x: random(zx - 100, zx + 100),
      y: random(zy, zy + 50)
    };
    var dx3 = {
      x: zx,
      y: zy
    };
    for (var i = 0; i < 4; i++) {
      eval("point.push(dx" + i + ")");
    }
    log(point[3].x);

    for (let i = 0; i < 1; i += 0.08) {
      xxyy = [parseInt(bezier_curves(point, i).x), parseInt(bezier_curves(point, i).y)];

      xxy.push(xxyy);
    }

    log(xxy);
    gesture.apply(null, xxy);

    function bezier_curves(cp, t) {
      cx = 3.0 * (cp[1].x - cp[0].x);
      bx = 3.0 * (cp[2].x - cp[1].x) - cx;
      ax = cp[3].x - cp[0].x - cx - bx;
      cy = 3.0 * (cp[1].y - cp[0].y);
      by = 3.0 * (cp[2].y - cp[1].y) - cy;
      ay = cp[3].y - cp[0].y - cy - by;
      tSquared = t * t;
      tCubed = tSquared * t;
      result = {
        x: 0,
        y: 0
      };
      result.x = ax * tCubed + bx * tSquared + cx * t + cp[0].x;
      result.y = ay * tCubed + by * tSquared + cy * t + cp[0].y;
      return result;
    }
  },

  record(timeLimit) {
    return new Promise((resolve, reject) => {
      const defaultOption = {
        timeLimit: 10
      };
      if (!timeLimit) {
        timeLimit = defaultOption.timeLimit;
      }

      //adb 录屏
      const IS_ROOT = files.exists("/sbin/su") || files.exists("/system/xbin/su") || files.exists("/system/bin/su");
      if (!IS_ROOT) {
        toast("没有root权限，无法执行");
        reject("没有root权限，无法执行");
        exit;
      }

      // 推流： https://shu1shu2.com/article/2022/4/22/38.html
      // adb -s 9305ac03 shell screenrecord --bit-rate 8000000 --size 1280x720 --time-limit 30 /sdcard/download/demo.mp4 --verbose
      // https://blog.csdn.net/shenfengchen/article/details/111364422
      var savePath = `/sdcard/download/${new Date().getTime()}_hotel.mp4`; // 保存路径
      var bitRate = "8000000";
      var cmd = `screenrecord --bit-rate ${bitRate} --time-limit ${timeLimit} ${savePath}`;
      try {
        toast(`开始录制，录制时间${timeLimit}秒，保存目录：${savePath}`);

        var result = shell(cmd, true); //第二个参数： 是否以root权限运行，默认为false。
        // 4.1 随机滑动
        fns.sml_move(400, 1800, 800, 230, timeLimit);

        if (result.code == 0) {
          sleep(3000);
          var killCmd = "pkill -l SIGINT -f screenrecord"; // 停止录屏的命令
          shell(killCmd, true); // 异步执行命令
          var msg = "录屏结束，保存在Download目录" + savePath;
          resolve({ savePath });
          return errorFn(true, msg, { savePath });
        } else {
          reject(result.error);
          var msg = `执行失败~: ${result.error}`;
          return errorFn(false, msg);
        }
      } catch (error) {
        reject(error);
        return errorFn(false, error);
      }
    });
  },
  // 文件上传
  uploadFile(filePath) {
    return new Promise((resolve, reject) => {
      var url = `http://192.168.2.194:8080/fileupload`;
      threads.start(function () {
        var res = http.postMultipart(url, {
          imei: "",
          upload: open(filePath) // 要上传的字段名称和路径
        });
        if (res.statusCode != 200) {
          errorFn(true, `上传失败: ${res.statusCode} ${res.statusMessage}`);
          reject(res);
        }
        let r = res.body.string();
        errorFn(true, `上传成功: ${r}`);
        resolve(r);
      });
    });
  }
};

function errorFn(status, msg, data) {
  toast(msg);
  // exit();
  return {
    status,
    msg,
    data
  };
}

// 1、检测是否安装微信
if (!fns.checkIsWx()) {
  toast("微信未安装, 请安装微信后再试~");
  exit();
}

//   2、 请求接口，获取远程二维码图片
fns.getQrSave();

//  3、打开微信-扫一扫
fns.openWxSys();

// 4、开始录屏

fns
  .record(10)
  .then((res) => {
    return fns.uploadFile(res.savePath);
  })
  .then((res) => {
    console.log("🚀 ~ file: index.js:271 ~ fns.record ~ res:", res);
  })
  .catch((err) => {
    console.log("🚀 ~ file: index.js:273 ~ err:", err);
  });
