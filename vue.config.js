module.exports = {
  css: {
    loaderOptions: {
      scss: {
        additionalData: `
          @import "~@/scss/main.scss";
          `,
      },
    },
  },

  transpileDependencies: ["vuetify"],
};
