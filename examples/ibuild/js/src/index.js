export const MyPlugin = {
  install(Vue, options) {
    Vue.mixin({
      mounted() {
        console.log('Mounted!');
      },
    });
  },
};
