<template>
  <div class="ctn">
    <a-card style="width: 100%; max-width: 600px" bodyStyle="padding:10px 24px">
      <template #title>
        <nuxt-link to="/forts" style="color: black;"> 头衔申请 </nuxt-link>
      </template>
      <template #extra>
        <img :src="touImg" class="tou" @click="handleTouClick" :class="[enbaledDafaguan && 'enabled']" />
      </template>
      <a-form :model="formState" name="basic" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }" autocomplete="off"
        @finish="onFinish" @finishFailed="onFinishFailed">
        <a-form-item label="服务器" name="kindom" :rules="[{ required: true, message: '不能为空' }]">
          <a-input v-model:value="formState.kindom" placeholder="如52服，则填52" />
        </a-form-item>
        <a-form-item label="失落号码" name="lost">
          <a-input v-model:value="formState.lost" placeholder="如：C11395（仅失落之地填写）" />
        </a-form-item>
        <a-form-item label="X坐标" name="x" :rules="[{ required: true, message: '不能为空' }]">
          <a-input v-model:value="formState.x" />
        </a-form-item>
        <a-form-item label="Y坐标" name="y" :rules="[{ required: true, message: '不能为空' }]">
          <a-input v-model:value="formState.y" />
        </a-form-item>
        <a-form-item label="头衔类型" name="type" :rules="[{ required: true, message: '不能为空' }]">
          <a-select v-model:value="formState.type">
            <a-select-option v-for="item in options" :value="item.name" :disabled="item.disabled">
              {{ item.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="口令" name="password" :rules="[{ required: true, message: '不能为空' }]">
          <a-input v-model:value="formState.password" />
        </a-form-item>

        <a-form-item :wrapper-col="{ offset: 0 }" class="text-center">
          <div class="fail-counts">
            当前失败请求 <span style="color: red">{{ failCounts }}</span> 条
          </div>
          <a-button type="primary" html-type="submit" size="large" class="mt-2">
            提交（{{ queueMessage }}）
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>
<script lang="ts" setup>
import { reactive } from "vue";
import dayjs from "dayjs";
import { cacheStorage } from "~/utils";
import { ask, getQueueNumber, getFailCounts } from "@/api/request";
import type { Location } from "@/model";
import touImg from "@/assets/image/tou.png";
const FORM_CACHE = "form";

const touClickTimes = ref(0);
const enbaledDafaguan = computed(() => touClickTimes.value >= 8);
function handleTouClick() {
  touClickTimes.value++;
}

message.config({
  top: "20vh",
  duration: 2,
  maxCount: 3,
});
const options = computed(() => [
  {
    name: "大科学家",
  },
  {
    name: "大建筑师",
  },
  {
    name: "公爵",
  },
  {
    name: "大法官",
    disabled: !enbaledDafaguan.value,
  },
]);

const formState = reactive<Location>({
  kindom: "",
  lost: "",
  x: "",
  y: "",
  type: "",
  password: "",
});
const onFinish = async (values: any) => {
  try {
    const _cache = cacheStorage.get(FORM_CACHE);
    if (_cache && _cache.x === values.x && _cache.y === values.y) {
      if (_cache.time) {
        if (dayjs().subtract(1, "minute").isBefore(dayjs(_cache.time))) {
          message.error("请求处理中~请勿重复提交!");
          return;
        }
      }
    }
    cacheStorage.set(FORM_CACHE, { ...values, time: dayjs() });
    await ask(values);
    fetQueue();
  } catch (error) {
    alert(error);
  }
};

const onFinishFailed = (errorInfo: any) => {
  console.log("Failed:", errorInfo);
  message.error("填写有误请检查");
};

const queueMessage = ref("有*个请求排队中");

function fetQueue() {
  getQueueNumber(formState.kindom).then((res) => {
    queueMessage.value = res;
  });
}

const failCounts = ref(0);
function fetFailCounts() {
  getFailCounts(formState.kindom).then((res) => {
    failCounts.value = res;
  });
}

onMounted(() => {
  const initialValues = cacheStorage.get(FORM_CACHE);
  if (initialValues) {
    Object.keys(initialValues).forEach((key) => {
      formState[key] = initialValues[key];
    });
  }
  fetQueue();
  fetFailCounts();
});
</script>
<style scoped>
.ctn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #efefef;
  min-height: 100vh;
  margin: auto;
  padding: 10px;
  background: linear-gradient(0deg,
      rgba(0, 0, 0, 0.8) 0%,
      rgba(0, 0, 0, 0.8) 100%),
    url(@/assets/image/rok-bg.jpg);
  background-size: 200px;
}

.tou {
  width: 60px;
}

.tou.enabled {
  filter: hue-rotate(30deg);
}

.fail-counts {
  font-size: 12px;
}

@media (max-width: 575px) {
  :deep(.ant-form .ant-form-item) {
    margin-bottom: 0;
  }

  :deep(.ant-form .ant-form-item .ant-form-item-label) {
    padding-bottom: 0;
  }
}
</style>
