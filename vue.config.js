module.exports = {
  lintOnSave: false,
  baseUrl: './',
  outputDir: 'docs',
  productionSourceMap: false,
  pwa: { workboxPluginMode: 'GenerateSW', workboxOptions: { skipWaiting: true, clientsClaim: true } },
  devServer: {
    https: true,
    public: 'petrenko-story.ru',
  },
};
