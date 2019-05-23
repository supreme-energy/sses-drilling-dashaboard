const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const project = require("../project.config");

const inProject = path.resolve.bind(path, project.basePath);
const inProjectSrc = file => inProject(project.srcDir, file);

const __DEV__ = project.env === "development";
const __TEST__ = project.env === "test";
const __PROD__ = project.env === "production";

const config = {
  mode: __DEV__ ? "development" : "production",
  entry: {
    normalize: [inProjectSrc("normalize")],
    main: [inProjectSrc(project.main)]
  },
  devtool: project.sourcemaps ? "source-map" : false,
  output: {
    path: inProject(project.outDir),
    filename: __DEV__ ? "[name].js" : "[name].[chunkhash].js",
    publicPath: project.publicPath
  },
  resolve: {
    modules: [inProject(project.srcDir), "node_modules"],
    extensions: ["*", ".js", ".jsx", ".json"]
  },
  externals: project.externals,
  module: {
    rules: []
  },
  plugins: [
    new webpack.DefinePlugin(
      Object.assign(
        {
          "process.env": { NODE_ENV: JSON.stringify(project.env), DEPLOY_ENV: JSON.stringify(process.env.DEPLOY_ENV) },
          __DEV__,
          __TEST__,
          __PROD__
        },
        project.globals
      )
    )
  ]
};

// JavaScript
// ------------------------------------
config.module.rules.push({
  test: /\.(js|jsx)$/,
  exclude: /node_modules/,
  use: [
    {
      loader: "babel-loader",
      query: {
        cacheDirectory: true,
        plugins: [
          "babel-plugin-transform-class-properties",
          "babel-plugin-syntax-dynamic-import",
          [
            "babel-plugin-transform-runtime",
            {
              helpers: true,
              polyfill: false, // we polyfill needed features in src/normalize.js
              regenerator: true
            }
          ],
          [
            "babel-plugin-transform-object-rest-spread",
            {
              useBuiltIns: true // we polyfill Object.assign in src/normalize.js
            }
          ]
        ],
        presets: [
          "babel-preset-react",
          [
            "babel-preset-env",
            {
              modules: false,
              targets: Object.assign({}, project.targetEnvironments, { uglify: true })
            }
          ]
        ]
      }
    }
  ]
});

// Styles
// ------------------------------------
const extractStyles = new MiniCssExtractPlugin({
  filename: __DEV__ ? "styles/[name].css" : "styles/[name].[contenthash].css",
  allChunks: true,
  disable: false
});

config.module.rules.push({
  test: /\.(sass|scss|css)$/,
  use: [
    __DEV__ ? "style-loader" : MiniCssExtractPlugin.loader,
    {
      loader: "css-loader",
      options: {
        sourceMap: project.sourcemaps,
        modules: project.scssModules,
        localIdentName: __DEV__ ? "[name]__[local]___[hash:base64:5]" : "[hash:base64]",
        importLoaders: 1,
        minimize: {
          autoprefixer: {
            add: true,
            remove: true,
            browsers: ["last 2 versions"]
          },
          discardComments: {
            removeAll: true
          },
          discardUnused: false,
          mergeIdents: false,
          reduceIdents: false,
          safe: true,
          sourcemap: project.sourcemaps
        }
      }
    },
    {
      loader: "sass-loader",
      options: {
        sourceMap: project.sourcemaps,
        includePaths: [inProjectSrc("styles")]
      }
    }
  ]
});
config.plugins.push(extractStyles);

// Images
// ------------------------------------
config.module.rules.push({
  test: /\.(png|jpg|gif)$/,
  loader: "url-loader",
  options: {
    limit: 8192
  }
});

// Fonts
// ------------------------------------
[
  ["woff", "application/font-woff"],
  ["woff2", "application/font-woff2"],
  ["otf", "font/opentype"],
  ["ttf", "application/octet-stream"],
  ["eot", "application/vnd.ms-fontobject"],
  ["svg", "image/svg+xml"]
].forEach(font => {
  const extension = font[0];
  const mimetype = font[1];

  config.module.rules.push({
    test: new RegExp(`\\.${extension}$`),
    loader: "url-loader",
    options: {
      name: "fonts/[name].[ext]",
      limit: 10000,
      mimetype
    }
  });
});

// HTML Template
// ------------------------------------
config.plugins.push(
  new HtmlWebpackPlugin({
    template: inProjectSrc("index.html"),
    defaultAttribute: "defer",
    inject: true,
    minify: {
      collapseWhitespace: true
    }
  })
);

// Development Tools
// ------------------------------------
if (__DEV__) {
  config.entry.main.push(`webpack-hot-middleware/client.js?path=${config.output.publicPath}__webpack_hmr`);
  config.plugins.push(new webpack.HotModuleReplacementPlugin(), new webpack.NamedModulesPlugin());
}

// Bundle Splitting
// ------------------------------------
if (!__TEST__) {
  const cacheGroups = {
    normalize: {
      name: "normalize",
      chunks: "all",
      minChunks: 2,
      priority: -10
    }
  };

  if (project.vendors && project.vendors.length) {
    config.entry.vendor = project.vendors;
    cacheGroups.vendor = {
      name: "vendor",
      chunks: "all",
      minChunks: 2
    };
  }

  config.optimization = {
    splitChunks: {
      cacheGroups: cacheGroups
    },
    runtimeChunk: {
      name: "manifest"
    }
  };
}

// Production Optimizations
// ------------------------------------
if (__PROD__) {
  config.plugins.push(
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.HashedModuleIdsPlugin()
  );

  config.optimization.minimizer = [
    new UglifyJsPlugin({
      sourceMap: !!config.devtool,
      extractComments: false,
      uglifyOptions: {
        warnings: false,
        screw_ie8: true,
        conditionals: true,
        unused: true,
        comparisons: true,
        sequences: true,
        dead_code: true,
        evaluate: true,
        if_return: true,
        join_vars: true
      }
    })
  ];
}

module.exports = config;
