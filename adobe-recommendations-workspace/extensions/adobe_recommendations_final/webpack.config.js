/* eslint-disable */
const webpack = require("webpack");
const dotenv = require("dotenv");
const path = require("path");
const colors = require("colors");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const ReplaceInFileWebpackPlugin = require("replace-in-file-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const appConfig = require("./static/app-dev-config.json");

const env = dotenv.config().parsed;
const envKeys = env
  ? Object.keys(env).reduce((prev, next) => {
      prev[`process.env.${next}`] = JSON.stringify(env[next]);
      return prev;
    }, {})
  : {};

envKeys["process.env.API_URL"] =
  envKeys["process.env.API_URL"] ||
  (process.env.API_URL
    ? JSON.stringify(process.env.API_URL)
    : JSON.stringify(""));

const APPNAME = appConfig.appName;
const APPPATH = appConfig.appPath;
const developmentMarketplaceDomain = appConfig.marketplaceDomain;
const PORT = "7230";
const today = new Date().toISOString();

const publicPath = path.join("/", `micro-ui/${APPNAME}`, "/");
const staticContentPath = path.join(__dirname, "static");

module.exports = (cliEnv) => {
  const isDevMode = cliEnv && cliEnv.local;

  // `developmentEnvironmentDomain` is the domain used to access your application.
  // This domain should be added to your host file.
  const developmentEnvironmentDomain = "localhost";

  // `developmentMarketplaceDomain` is the domain of your target marketplace for development.
  const extensionsDevDocsUrlRoot =
    "https://developer.appdirect.com/user-guides/extensions";

  console.log("--------------------****--------------------");
  console.log(" ");
  console.log(" ");
  if (isDevMode) {
    console.log("Welcome to your extension development environment!".green);
    console.log(" ");
    console.log(
      colors.bold(
        "WARNING: Be sure to have Developer Mode enabled on the extension you want to modify in your marketplace.\n"
      ).yellow
    );
    console.log(
      `To access your extension locally, use the following URL: ${developmentMarketplaceDomain}${APPPATH}?devMode=true&appName=${APPNAME}`
        .green
    );
  } else {
    console.log(
      "Your app is currently building. This should take a minute or two...\n"
        .green
    );
    console.log(
      "You'll find your newly minted extension zipped inside of the /dist folder."
        .green
    );
    console.log(" ");
    console.log(
      `The next step will be to upload this version of your extension to your marketplace. For more info, consult the documentation here: ${extensionsDevDocsUrlRoot}/how-tos/upload-extension`
        .green
    );
  }
  console.log(" ");
  console.log(" ");
  console.log("--------------------****--------------------");
  console.log(" ");

  const plugins = [
    new webpack.DefinePlugin({
      IS_DEVELOPMENT: isDevMode,
      ID_BUILD: Math.floor(Math.random() * 1000000) + 1,
      ...envKeys,
    }),
    new webpack.container.ModuleFederationPlugin({
      name: APPNAME,
      filename: "remoteEntry.js",
      exposes: {
        "./Root": "./src/components/Root",
        "./RemoteReactDom": "./src/RemoteReactDom",
      },
    }),
  ];

  const ProdPlugins = [
    new CopyPlugin({
      patterns: [{ from: "static", to: "./" }],
    }),
    new ReplaceInFileWebpackPlugin([
      {
        dir: "build",
        files: ["remoteEntry.js"],
        rules: [
          {
            search: '"bundlefetcher"',
            replace: `ad_custom_app_get_domain("${APPNAME}")`,
          },
          {
            search: 'e+".bundle.js"',
            replace: `ad_custom_app_get_bundle("${APPNAME}", e)`,
          },
        ],
      },
    ]),
    new CleanWebpackPlugin({
      cleanStaleWebpackAssets: true,
      protectWebpackAssets: false,
      cleanOnceBeforeBuildPatterns: ["**.*"],
      cleanAfterEveryBuildPatterns: ["main.bundle.js", "*.LICENSE.txt"],
    }),
  ];

  if (!isDevMode) {
    plugins.push(...ProdPlugins);
  }

  return {
    cache: false,
    module: {
      rules: [
        {
          test: /\.(tsx|ts|js)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
          },
        },
        {
          test: /\.txt$/,
          use: {
            loader: "raw-loader",
          },
        },
        {
          test: /\.html$/,
          use: [
            {
              loader: "html-loader",
            },
          ],
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            // Creates `style` nodes from JS strings
            {
              loader: "style-loader",
              options: { insert: "#microui-app-styles" },
            },
            // Translates CSS into CommonJS
            "css-loader",
            // Compiles Sass to CSS
            "sass-loader",
          ],
        },
        {
          test: /\.css$/i,
          exclude: /\.module\.css$/i,
          use: [
            // Creates `style` nodes from JS strings
            {
              loader: "style-loader",
              options: { insert: "#microui-app-styles" },
            },
            // Translates CSS into CommonJS
            "css-loader",
            {
              loader: "postcss-loader",
            },
          ],
        },
        {
          test: /\.module\.css$/i,
          use: [
            // Creates `style` nodes from JS strings
            {
              loader: "style-loader",
              options: { insert: "#microui-app-styles-modules" },
            },
            // Translates CSS into CommonJS
            "css-loader",
            {
              loader: "postcss-loader",
            },
          ],
        },
        {
          test: /\.(pdf|jpg|png|gif|ico)$/,
          use: [
            {
              loader: "url-loader",
              options: {
                name: "[path][name]-[hash:8].[ext]",
              },
            },
          ],
        },
        {
          test: /\.svg$/,
          use: ["@svgr/webpack"],
          include: [path.resolve("node_modules/remixicon/icons")],
        },
      ],
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx"],
      alias: {
        react: path.resolve(__dirname, "node_modules/react"),
        "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
      },
    },
    devtool: isDevMode ? "eval-source-map" : false,
    plugins: plugins,
    output: {
      publicPath: isDevMode ? "auto" : "bundlefetcher",
      filename: "[name].bundle.js",
      clean: true,
      path: path.resolve(__dirname, "build"),
    },
    stats: {
      colors: true,
      hash: false,
      version: false,
      timings: false,
      assets: false,
      chunks: false,
      modules: false,
      reasons: false,
      children: false,
      source: false,
      errors: true,
      errorDetails: true,
      warnings: false,
      publicPath: false,
    },
    devServer: {
      hot: true,
      historyApiFallback: {
        index: publicPath,
      },
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods":
          "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers":
          "X-Requested-With, content-type, Authorization",
      },
      port: PORT,
      // Enabling serving static assets
      static: {
        directory: staticContentPath,
        publicPath,
      },
      host: cliEnv && developmentEnvironmentDomain,
      allowedHosts: "all",
      devMiddleware: {
        publicPath,
      },
      proxy: {
        "/api": {
          context: () => true,
          target: developmentMarketplaceDomain,
          secure: false,
          changeOrigin: true,
        },
      },
    },
  };
};
