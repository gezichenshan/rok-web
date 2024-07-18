<template>
  <div class="ctn">
    <a-card>
      <h2 class="pt-4 pb-4">头衔申请</h2>
      <a-form
        :model="formState"
        name="basic"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 16 }"
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

        <a-form-item label="失落" name="lost">
          <a-input
            v-model:value="formState.lost"
            placeholder="仅失落之地填写"
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
            <a-select-option value="大科学家">大科学家</a-select-option>
            <a-select-option value="大建筑师">大建筑师</a-select-option>
            <a-select-option value="公爵">公爵</a-select-option>
            <a-select-option value="大法官" disabled>大法官</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          label="口令"
          name="password"
          :rules="[{ required: true, message: '不能为空' }]"
        >
          <a-input v-model:value="formState.password" />
        </a-form-item>

        <a-form-item :wrapper-col="{ offset: 8, span: 16 }">
          <a-button type="primary" html-type="submit">提交</a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>
<script lang="ts" setup>
import { reactive } from "vue";
import { cacheStorage } from "~/utils";
import { ask } from "@/api/request";
import type { Location } from "@/model";
const FORM_CACHE = "form";

const formState = reactive<Location>({
  kindom: "",
  lost: "",
  x: "",
  y: "",
  type: "",
  password: "",
});
const onFinish = (values: any) => {
  console.log("Success:", values);
  cacheStorage.set(FORM_CACHE, values);
  ask(values);
};

const onFinishFailed = (errorInfo: any) => {
  console.log("Failed:", errorInfo);
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
  background-color: #efefef;
  height: 100vh;
  max-width: 800px;
  margin: auto;
  padding: 10px;
}
</style>
