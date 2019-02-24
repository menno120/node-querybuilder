const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const webpack = require("webpack");

module.exports = {
	mode: "development",
	entry: {
		app: "./src/index.ts"
	},
	output: {
		filename: "[name].js",
		path: path.resolve(__dirname, "dist")
	},
	devtool: "inline-source-map",
	devServer: {
		contentBase: "./dist"
	},
	watch: true,
	watchOptions: {
		ignored: /node_modules/
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
				exclude: /node_modules/
			}
		]
	},
	resolve: {
		extensions: [".tsx", ".ts", ".js"]
	}
};
