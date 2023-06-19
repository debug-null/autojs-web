import * as joi from "joi";
import * as Koa from "koa";
import {
  Controller,
  Get,
  QuerySchame,
  Query,
  Ctx,
  Post,
  BodySchame,
  Body,
  Description,
  Tag,
} from "../../../common/application";
import { SYS_ROLE } from "../../../utils/enums";
import { ResultUtils } from "../../../utils/result-utils";
import ScriptExecutor from "@/service/ScriptExecutor";
import { DeviceManager } from "../../../service/DeviceManager";
import { WebSocketManager } from "../../../service/WebSocketManager";


@Controller("/api")
@Description("api")
export class Api {
  @Post("/hotel-start")
  @Description("版本")
  async hotelstart(@Body() body: any) {
    // 接收二维码图片
    const base64Img = body.qrImg; // 获取传递的图片内容
    if(base64Img){
      const data = {
        type: 'hotel-record',
        data: {
          command: 'hotel-record',
          qrImg: base64Img,
        }
      };

      WebSocketManager.getInstance().getClients().forEach((client) => {
        if (client.type === 'device') {
          WebSocketManager.getInstance().sendMessage(client, data);
        }
      });

    }else{
      return ResultUtils.badRequest('没有图片')
    }
  return

    const ol = DeviceManager.getInstance().getOnlineDevices();
    console.log("🚀 ~ file: api.controller.ts:27 ~ Api ~ version ~ ol:", ol)

    if (ol.length === 0) {
      throw new Error('没有在线设备');
    }

    // 发送酒店专属脚本
    const data = {
      type: 'command',
      data: {
        command: 'run',
        id: 'hotel-record',
        view_id: 'hotel-record',
        name: 'hotel-record',
        script: `toastLog("hello")`,
      }
    };

    WebSocketManager.getInstance().getClients().forEach((client) => {
      if (client.type === 'device') {
        WebSocketManager.getInstance().sendMessage(client, data);
      }
    });

    return ResultUtils.success({
      version: "1.0.0",
    });
  } 
}
