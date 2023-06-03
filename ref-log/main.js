"ui";

ui.layout(
  <vertical padding="16">
    <button textSize="20sp" id="get_qr" margin="30 150 30 10" style="Widget.AppCompat.Button.Colored">
      启动22
    </button>
  </vertical>
);
console.show(true); //程序结束自动 隐藏控制台
ui.get_qr.on("click", () => {
  toast("点我啦");
  const action = require("./actions.js");
  const record = require("./adb-record.js");

  if (!device.isScreenOn()) {
    device.wakeUp(); // 点亮屏幕
  }

  if (!action.checkIsWx()) {
    toast("微信未安装, 请安装微信后再试~");
    exit();
  }

  const res = action.openWxSys();
  console.log("0--", res);
  //   var res = record(); // 录制
});
