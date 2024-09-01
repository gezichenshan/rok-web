<script setup>
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import zhCN from 'ant-design-vue/es/locale/zh_CN';
</script>
<template>
  <div>
    <a-extract-style>
      <a-config-provider :locale="zhCN">
        <NuxtPage />
      </a-config-provider>
    </a-extract-style>
  </div>
</template>
