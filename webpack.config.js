module.exports = {
	mode: 'development',
	entry: `./build/javascripts/${process.env.npm_config_project}.js`,
	output: {
		publicPath: '/build/',
		filename: 'bundle.js'
	}
};
