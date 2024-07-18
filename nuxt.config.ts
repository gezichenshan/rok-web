// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  srcDir: "src",
  modules: ["@ant-design-vue/nuxt", "@unocss/nuxt"],
  css: ["@/assets/reboot.css"],
});
