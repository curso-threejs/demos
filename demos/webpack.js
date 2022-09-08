const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCSSExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");
const fs = require("fs");

// Toda subcarpeta dentro de './demos' representa una demo, entonces hay que incluir el HTML
// La variable 'demos' es una lista de los nombres de cada demo
const demos = fs
  .readdirSync("./demos")
  .filter((file) => fs.statSync(path.join("./demos", file)).isDirectory());

module.exports = {
  // 'entry' es el Javascript que se va a incluir en cada HTML (Webpack se encarga de traducir Node a JS vainilla)
  entry: {
    // Home
    "": path.resolve(__dirname, `./script.js`),

    // Agregamos todas las demos
    ...demos.reduce(
      (entries, demoName) => ({
        ...entries,
        [demoName]: path.resolve(__dirname, `./${demoName}/script.js`),
      }),
      {}
    ),
  },

  mode: "development",
  output: {
    hashFunction: "xxhash64",
    filename: "bundle.[contenthash].js",
    path: path.resolve(__dirname, "./dist"),
  },
  devtool: "source-map",
  devServer: {
    open: true,
  },

  // Acá incluimos los HTML para que Webpack haga el bundle
  plugins: [
    // Home page
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, `./index.html`),
      minify: true,
      chunks: [""], // Referencia a los "entry"
    }),

    // Todas las demos
    ...demos.map(
      (demoDir) =>
        new HtmlWebpackPlugin({
          template: path.resolve(__dirname, `./${demoDir}/index.html`),
          filename: demoDir + ".html",
          chunks: [demoDir],
        })
    ),

    // CSS ya que estamos
    new MiniCSSExtractPlugin(),
  ],

  module: {
    rules: [
      // HTML
      {
        test: /\.(html)$/,
        use: ["html-loader"],
      },

      // JS
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },

      // CSS
      {
        test: /\.css$/,
        use: [MiniCSSExtractPlugin.loader, "css-loader"],
      },

      // Images
      {
        test: /\.(jpg|png|gif|svg)$/,
        type: "asset/resource",
        generator: {
          filename: "assets/images/[hash][ext]",
        },
      },

      // Fonts
      {
        test: /\.(ttf|eot|woff|woff2)$/,
        type: "asset/resource",
        generator: {
          filename: "assets/fonts/[hash][ext]",
        },
      },
    ],
  },
};
