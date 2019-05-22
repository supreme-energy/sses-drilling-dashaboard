const NODE_ENV = process.env.NODE_ENV || "development";
const TARGET_ENV = process.env.TARGET_ENV || NODE_ENV;
const DEPLOY_ENV = process.env.DEPLOY_ENV || "";
const basename = DEPLOY_ENV === "dev" ? "/dev/index.html" : "";
const appConfigs = {
  development: {
    serverUrl: "https://2018dev.sgta.us/sses",
    username: "subsurfacegeosteering",
    password: "sgtageo2018",
    basename
  },
  production: {
    isProduction: true,
    serverUrl: "https://2018dev.sgta.us/sses",
    username: "subsurfacegeosteering",
    password: "sgtageo2018",
    basename
  }
};

module.exports = {
  /** The environment to use when building the project */
  env: NODE_ENV,
  /** The full path to the project's root directory */
  basePath: __dirname,
  /** The name of the directory containing the application source code */
  srcDir: "src",
  /** The file name of the application's entry point */
  main: "main",
  /** The name of the directory in which to emit compiled assets */
  outDir: "dist",
  /** The base path for all projects assets (relative to the website root) */
  publicPath: "/" + DEPLOY_ENV === "dev" ? "dev" : "",
  /** Whether to generate sourcemaps */
  sourcemaps: true,
  /** Whether to use CSS Modules in your scss files */
  scssModules: true,
  /** A hash map of keys that the compiler should treat as external to the project */
  externals: {},
  /** A hash map of variables and their values to expose globally */
  globals: {
    __CONFIG__: JSON.stringify(appConfigs[TARGET_ENV]),
    __PRODUCTION__: JSON.stringify(!!appConfigs[TARGET_ENV].isProduction)
  },
  /** hashmap of target environments the code must run in (see https://github.com/babel/babel-preset-env#targets */
  targetEnvironments: {
    chrome: "57",
    firefox: "50",
    edge: "14",
    safari: "10"
  },
  /** Whether to enable verbose logging */
  verbose: false,
  /** The list of modules to bundle separately from the core application code */
  vendors: ["react", "react-dom", "redux", "react-redux", "redux-thunk", "react-router"]
};
