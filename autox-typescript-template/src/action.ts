export function test() {
  toast("222");
}

export function checkAccessibility(自动) {
  var 应用包名 = context.getPackageName();
  var 应用名 = getAppName(应用包名);
  for (let a = 0; a < 11; a++) {
    try {
      let a = packageNameMatches(/.+/).findOnce();
      log(a.packageName());
      break;
    } catch (e) {
      try {
        auto();
      } catch (e) {}
      sleep(1000);
      toastLog("请选择，" + 应用名 + "  打开无障碍辅助功能");
      let autojs = context.getPackageName() + "/com.stardust.autojs.core.accessibility.AccessibilityService";
      if (自动) {
        try {
          重启无障碍root(autojs);
        } catch (e) {
          toast("自动开启无障碍失败，请手动开始");
          sleep(2000);
        }
      }
      sleep(3000);
    }
    if (a == 4) {
      exit();
    }
  }

  function 重启无障碍root(参数) {
    toastLog("正在尝试使用root权限开启无障碍");
    var s = shell("settings get secure enabled_accessibility_services", true).result.replace(/\n/, "");
    if (s.indexOf(参数) > -1) {
      s = s.replace(参数, "");
      var 结果 = shell("settings put secure enabled_accessibility_services :" + s, true);
      if (结果.code) {
        toastLog("尝试开启无障碍服务异常");
        return;
      }
    }
    s += ":" + 参数;
    s = s.replace(/:+/gim, ":");
    shell("settings put secure accessibility_enabled 1", true);
    var code = shell("settings put secure enabled_accessibility_services " + s, true).code;
    if (code) {
      toastLog("尝试开启无障碍服务异常");
      return;
    }
    shell("settings put secure accessibility_enabled 1", true);
  }
}

// 获取唯一设备ID
export function getUid() {
  const eName = "yanni";
  var imei = device.getAndroidId();
  var uniqueId = `${eName}_${imei}`;
  return uniqueId;
}
