<template>
  <div class="log-container">
    <!-- <div class="title">Logcat</div> -->
    <div class="tool-bar">
      <el-select v-model="deviceSelect" size="mini" placeholder="指定设备" style="width: 150px;">
        <el-option label="全部设备" value />
        <el-option
          v-for="item in $store.state.device.list.filter(i => i.is_online)"
          :key="item.device_id"
          :label="item.name"
          :value="item.device_id"
        />
      </el-select>
      <el-select v-model="categorySelect" size="mini" placeholder="指定类别" style="width: 120px; margin-left: 10px;">
        <el-option label="全部类别" value />
        <el-option
          v-for="item in $store.state.device.category"
          :key="item"
          :label="item"
          :value="item"
        />
      </el-select>
      <el-select
        v-model="logLevel"
        size="mini"
        placeholder="日志级别"
        style="width: 100px; margin-left: 10px;"
      >
        <el-option label="Verbose" value="" />
        <el-option label="Debug" value="D" />
        <el-option label="Info" value="I" />
        <el-option label="Warn" value="W" />
        <el-option label="Error" value="E" />
      </el-select>
      <el-input
        v-model="findStr"
        placeholder="请输入内容"
        size="mini"
        prefix-icon="el-icon-search"
        style="width: 150px; margin-left: 10px;"
      />
      <div class="actions">
        <el-button
          v-if="showRun"
          icon="el-icon-caret-right"
          plain
          circle
          size="mini"
          @click="runScript"
        />
        <slot />
        <el-button
          class="right mr10"
          icon="el-icon-circle-close"
          plain
          circle
          size="mini"
          @click="clearConsole"
        />
      </div>
    </div>
    <div
      ref="logScroller"
      v-auto-height:maxHeight="-10"
      class="log-scroller"
      :style="{ 'max-height': maxHeight + 'px' }"
    >
      <div v-for="(item, index) in showLogs" :key="index">{{ item.log }}</div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import WebSocketManager from "@/WebSocketClientManager";

export default {
  name: "DeviceLog",
  props: ["showRun"],
  data() {
    return {
      maxHeight: 500,
      messageListener: null,
      deviceSelect: "",
      categorySelect: '',
      logLevel: "",
      logs: [],
      findStr: '',
    };
  },
  computed: {
    ...mapGetters(["name"]),
    showLogs() {
      let result = this.logs;
      console.log("🚀 ~ file: index.vue:95 ~ showLogs ~ result:", result);
      if (this.deviceSelect) {
        result = result.filter((log) => {
          return log.device.device_id === this.deviceSelect;
        });
      }
      if (this.findStr) {
        result = result.filter((log) => {
          return log.log.indexOf(this.findStr) > -1;
        });
      }
      if (this.logLevel) {
        result = result.filter((log) => {
          return log.log.indexOf(`/${this.logLevel}:`) > 0;
        });
      }
      return result;
    }
  },
  created() {
    this.messageListener = message => {
      if (message.type === "log") {
        message.data.log = message.data.device.name + '-' + message.data.log;
        console.log("🚀 ~ file: index.vue:117 ~ created ~  message.data.log:", message);
        this.logs.push(message.data);
        this.$refs.logScroller.scrollTop = this.$refs.logScroller.scrollHeight;
      }
    };
    WebSocketManager.getInstance().addMessageListener(this.messageListener);
  },
  destroyed() {
    WebSocketManager.getInstance().removeMessageListener(this.messageListener);
  },
  methods: {
    clearConsole() {
      this.logs = [];
    },
    runScript() {
      this.$emit("run", {
        devices: this.deviceSelect
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.log-container {
  color: #303030;
}
.title {
  background-color: #eeeeee;
  border: 1px solid #5555553b;
  padding: 5px 10px;
}
.tool-bar {
  background-color: #f2f2f2;
  display: flex;
  padding: 10px;
}
.tool-bar .actions {
  flex-grow: 1;
  margin-left: 25px;
  padding-right: 5px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.log-scroller {
  overflow: auto;
  padding: 5px 5px 1.5em 10px;
}
</style>
