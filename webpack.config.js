const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");

module.exports = {
	mode: "development",
	entry: {
		app: "./src/index.ts"
	},
	output: {
		filename: "[name].js",
		path: path.resolve(__dirname, "./dist")
	},
	devtool: "inline-source-map",
	devServer: {
		contentBase: "./dist"
	},
	watch: true,
	watchOptions: {
		ignored: ["/node_modules/", "/dist/"]
	},
	plugins: [
		new CleanWebpackPlugin(["dist"]),
		new HtmlWebpackPlugin({
			title: require("./package.json").name
		})
	],
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: "ts-loader",
				exclude: ["/node_modules/", "/dist/"]
			}
		]
	},
	resolve: {
		extensions: [".tsx", ".ts", ".js"]
	},
	externals: {
		chalk: "chalk",
		joi: "joi",
		mysql: "mysql"
	}
};
