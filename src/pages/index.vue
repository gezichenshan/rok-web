<template>
  <div class="ctn">
    <a-card
      title="头衔申请"
      style="width: 100%; max-width: 600px"
      bodyStyle="padding:10px 24px"
    >
      <template #extra>
        <img
          :src="touImg"
          class="tou"
          @click="handleTouClick"
          :class="[enbaledDafaguan && 'enabled']"
        />
      </template>
      <a-form
        :model="formState"
        name="basic"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 20 }"
        autocomplete="off"
        @finish="onFinish"
        @finishFailed="onFinishFailed"
      >
        <a-form-item
          label="服务器"
          name="kindom"
          :rules="[{ required: true, message: '不能为空' }]"
        >
          <a-input
            v-model:value="formState.kindom"
            placeholder="如52服，则填52"
          />
        </a-form-item>

        <a-form-item label="失落号码" name="lost">
          <a-input
            v-model:value="formState.lost"
            placeholder="如：C11395（仅失落之地填写）"
          />
        </a-form-item>

        <a-form-item
          label="X坐标"
          name="x"
          :rules="[{ required: true, message: '不能为空' }]"
        >
          <a-input v-model:value="formState.x" />
        </a-form-item>
        <a-form-item
          label="Y坐标"
          name="y"
          :rules="[{ required: true, message: '不能为空' }]"
        >
          <a-input v-model:value="formState.y" />
        </a-form-item>
        <a-form-item
          label="头衔类型"
          name="type"
          :rules="[{ required: true, message: '不能为空' }]"
        >
          <a-select v-model:value="formState.type">
            <a-select-option
              v-for="item in options"
              :value="item.name"
              :disabled="item.disabled"
            >
              {{ item.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          label="口令"
          name="password"
          :rules="[{ required: true, message: '不能为空' }]"
        >
          <a-input v-model:value="formState.password" />
        </a-form-item>

        <a-form-item :wrapper-col="{ offset: 8, span: 16 }" class="mt-2">
          <a-button type="primary" html-type="submit">提交</a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>
<script lang="ts" setup>
import { reactive } from "vue";
import dayjs from "dayjs";
import { cacheStorage } from "~/utils";
import { ask } from "@/api/request";
import type { Location } from "@/model";
import touImg from "@/assets/image/tou.png";
const FORM_CACHE = "form";

const touClickTimes = ref(0);
const enbaledDafaguan = computed(() => touClickTimes.value >= 8);
function handleTouClick() {
  touClickTimes.value++;
}

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
const onFinish = (values: any) => {
  const _cache = cacheStorage.get(FORM_CACHE);
  if (_cache.x === values.x && _cache.y === values.y) {
    if (_cache.time) {
      if (dayjs().subtract(1, "minute").isBefore(dayjs(_cache.time))) {
        message.error("请求处理中~请勿重复提交!");
        return;
      }
    }
  }
  cacheStorage.set(FORM_CACHE, { ...values, time: dayjs() });
  ask(values);
};

const onFinishFailed = (errorInfo: any) => {
  console.log("Failed:", errorInfo);
  message.error("填写有误请检查");
};

onMounted(() => {
  const initialValues = cacheStorage.get(FORM_CACHE);
  if (initialValues) {
    Object.keys(initialValues).forEach((key) => {
      formState[key] = initialValues[key];
    });
  }
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
  background: linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.8) 0%,
      rgba(0, 0, 0, 0.8) 100%
    ),
    url(@/assets/image/rok-bg.jpg);
  background-size: 200px;
}
.tou {
  width: 60px;
}
.tou.enabled {
  filter: hue-rotate(30deg);
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
