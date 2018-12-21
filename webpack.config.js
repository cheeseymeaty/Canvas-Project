const fs = require('fs');

// Lists of projects inside ./build/javscripts/
// / In the format of: { filename: filepath }
const projects = (() => fs.readdirSync('./build/javascripts')
.reduce((entry, file) => {
	entry[file.slice(0, -3)] = `./build/javascripts/${file}`;
	return entry;
}, {})
)();

// Updates home.js
const exceptions = ['boilerplate', 'home'];
const data = fs.readFileSync('./build/javascripts/home.js', 'UTF8')
const replacement = 'const PROJECTS = [' + Object.keys(projects).filter(name => !exceptions.includes(name)).map(name => `'${name}'`).join(', ') + '];\r\n\r\n';
fs.writeFileSync('./build/javascripts/home.js',
	replacement +
	data.slice(data.indexOf('// STOP'))
);

module.exports = {
	mode: 'development',
	entry: projects,
	output: {
		publicPath: '/build/dist/',
		filename: '[name].js'
	}
};
