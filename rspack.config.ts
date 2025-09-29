import { defineConfig } from "@rspack/cli";
import { rspack } from "@rspack/core";
import { ReactRefreshRspackPlugin } from "@rspack/plugin-react-refresh";
import path, { resolve } from "path";

const isDev = process.env.NODE_ENV === "development";

// Target browsers, see: https://github.com/browserslist/browserslist
const targets = ["last 2 versions", "> 0.2%", "not dead", "Firefox ESR"];

export default defineConfig({
	devServer: {
		historyApiFallback: true,
	},
	entry: {
		main: "./web/main.tsx"
	},
	resolve: {
		extensions: ["...", ".ts", ".tsx", ".jsx"],
		alias: {
			'@': resolve(__dirname, 'src'),
		},
	},
	module: {
		rules: [
			{
				test: /\.svg$/,
				type: "asset"
			},
			{
				test: /\.(jsx?|tsx?)$/,
				use: [
					{
						loader: "builtin:swc-loader",
						options: {
							jsc: {
								parser: {
									syntax: "typescript",
									tsx: true
								},
								transform: {
									react: {
										runtime: "automatic",
										development: isDev,
										refresh: isDev
									}
								}
							},
							env: { targets }
						}
					}
				]
			}
		]
	},
	plugins: [
		new rspack.HtmlRspackPlugin({
			template: "./public/index.html"
		}),
		isDev ? new ReactRefreshRspackPlugin() : null
	].filter(Boolean),
	optimization: {
		minimizer: [
			new rspack.SwcJsMinimizerRspackPlugin(),
			new rspack.LightningCssMinimizerRspackPlugin({
				minimizerOptions: { targets }
			})
		],
		splitChunks: {
			chunks: "all",
			minSize: 0,
			cacheGroups: {
				vendors: {
					test: /[\\/]node_modules[\\/]/,
				}
			}
		}
	},
	experiments: {
		css: true
	},
	output: {
		publicPath: isDev ? 'auto' : '/static/',
		path: path.join(__dirname, 'dist'),
		filename: 'js/[name].js',
		cssFilename: 'css/[name].css',
		clean: true
	}
});
