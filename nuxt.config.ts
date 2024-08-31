// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  srcDir: "src",
  modules: ["@ant-design-vue/nuxt", "@unocss/nuxt"],
  css: ["@/assets/reboot.css"],
  app: {
    head: {
      meta: [
        { charset: "utf-8" },
        {
          name: "viewport",
          content:
            "width=device-width, initial-scale=1.0,maximum-scale=1.0,user-scalable=0",
        },
      ],
    },
  },
});