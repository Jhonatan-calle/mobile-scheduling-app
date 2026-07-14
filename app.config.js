const IS_DEV = process.env.APP_ENV === "development";
const IS_PREVIEW = process.env.APP_ENV === "preview";

export default ({ config }) => ({
  ...config,
  name: IS_DEV ? "Tapizados RC Dev" : IS_PREVIEW ? "Tapizados RC" : "Tapizados RC",
  android: {
    ...config.android,
    package: IS_DEV
      ? "com.jhonatancalle.tapizadosRc.dev"
      : IS_PREVIEW
        ? "com.jhonatancalle.tapizadosRc.preview"
        : "com.jhonatancalle.tapizadosRc",
  },
});
