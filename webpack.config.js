const path = require("path");
const Dotenv = require("dotenv-webpack");
// const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// import 'imports?require=>false!node_modules/resize-img/node_modules/es/jimp.js'

var config = {
  module: {},
};
const Main = Object.assign({}, config, {
  mode: "development",
  devtool: "inline-source-map",
  resolve: {
    extensions: [".js"],
  },
  entry: 
  {
    main:"./src/main/main.js",
  },
  target: "electron-main",
  resolve: {
    extensions: [".js"],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      // {
      //   test: /\.(png|jpe?g)$/,
      //   use: [
      //     {
      //       loader: 'responsive-loader',
      //       options: {
      //       adapter: require('responsive-loader/jimp')
      //       },
      //     },
      //   ]
      // }
     
    ],
  },
  // presets: ["@babel/preset-env"],
  // plugins: [                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
  //       ["@babel/transform-runtime"]
  //   ],
  plugins: [new Dotenv()],  
                                                                                    
  output: {
    path: path.resolve(__dirname, "./release/app"),
    filename: "main.js",
  },
});
const Renderer = Object.assign({}, config, {
  mode: "development",
  devtool: "inline-source-map",
  resolve: {
    extensions: [".js"],
  },
  entry:{
    app:  "./src/renderer/app.js",
  } ,

  resolve: {                                                                                                                  
    extensions: [".js"],                                                    
  },
  target: "electron-renderer",                                                                 
  module: {
    rules: [                                                                                                                  
                                                                   
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      // {
      //   test: /bootstrap\.js$/,
      //   use: 'imports-loader?jQuery=jquery,$=jquery,this=>window',
      // },
      
      // {
      //   test: /\.(html)$/,
      //   include: [path.resolve(__dirname, "./release/app")],
      //   use: {
      //     loader: "html-loader",
      //   },
      // },
      // {
      //   test: /\.css$/,
      //   use: [
      //     "style-loader",
      //     {
      //       loader: "css-loader",
      //       options: {
      //         importLoaders: 1,
      //         modules: true,
      //       },
      //     },
      //   ],
      //   include: /\.module\.css$/,
      // },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
        // exclude: /\.module\.css$/,
      },
      
     
    ],
   
      
      
  },
  plugins: [new Dotenv(), new MiniCssExtractPlugin({filename:"styles.css"})],
  output: {
    path: path.resolve(__dirname, "./release/app/js"),
    filename: "app.js",
  },
});




module.exports = [Main, Renderer];