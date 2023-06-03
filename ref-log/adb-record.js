module.exports = function record(timeLimit) {
  const defaultOption = {
    timeLimit: 10
  };
  if(!timeLimit){
    timeLimit = defaultOption.timeLimit;
  }

  //adb 录屏
  const IS_ROOT = files.exists("/sbin/su") || files.exists("/system/xbin/su") || files.exists("/system/bin/su");
  if (!IS_ROOT) {
    toast("没有root权限，无法执行");
    exit;
  }

  // 推流： https://shu1shu2.com/article/2022/4/22/38.html
  // adb -s 9305ac03 shell screenrecord --bit-rate 8000000 --size 1280x720 --time-limit 30 /sdcard/download/demo.mp4 --verbose
  // https://blog.csdn.net/shenfengchen/article/details/111364422
  var resolute = "375x820";
  var savePath = "/sdcard/download/demoddd222.mp4"; // 保存路径
  var bitRate = "8000000";
  var cmd = `screenrecord --bit-rate ${bitRate} --size ${resolute} --time-limit ${timeLimit} ${savePath}`;
  try {
    toast(`开始录制，录制时间${timeLimit}秒，保存目录：${savePath}`);
    var result = shell(cmd, true); //第二个参数： 是否以root权限运行，默认为false。
    if (result.code == 0) {
      sleep(3000);
      var killCmd = "pkill -l SIGINT -f screenrecord"; // 停止录屏的命令
      shell(killCmd, true); // 异步执行命令
      toast("录屏结束，保存在Download目录" + savePath);
      return savePath;
    } else {
      toast("执行失败~: " + result.error);
    }
  } catch (error) {
    log(error);
  }
};
