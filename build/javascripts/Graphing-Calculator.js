// < Declarations >
const canvas = document.querySelector('canvas');
const C = canvas.getContext('2d');

let { width, height } = canvas;

const settings = {
	equations: [
		x => x,
		x => x**2,
		x => Math.sin(x),
		x => 2**x
	],

	style: {
		text: {
			x: 5, y: 0,
			space: 15,
			separator: 5,
			font: '15px "Roboto Mono"'
		},

		line: {
			width: 2.5,
			defaultColor: 'rgb(255, 128, 0)',
			colors: [
				'rgb(255, 0, 0)',
				'rgb(0, 175, 0)',
				'rgb(0, 0, 255)'
			]
		},

		dot: {
			radius: 5,
			outlineWidth: 3
		},

		tick: {
			width: 2.5,
			length: 5,
			color: 'black'
		},

		grid: {
			width: 1,
			color: 'rgba(128, 128, 128, 0.5)'
		},

		border: {
			width: 5,
			visible: true,
			color: 'black'
		}
	},

	// The friction of the graph's velocity
	friction: 0.9,

	// How smooth each line is depending on the zoom
	// / Lower the number at your own risk! Can cause lag on weak computers if there's a lot of functions
	lineSmoothness: 0.5,

	// How far the zoom can go out
	zoomLimit: 2,

	// How smooth the zooming process is
	zoomEase: 5,

	// How smooth the mouse and dots are
	mouseEase: 10,

	// How many decimal places the displayed numbers go out to
	decimalLength: 3
};

const mouse = {
	real: { x: null, y: null },
	smooth: { x: null, y: null },
	previous: { x: null, y: null },
	velocity: { x: 0, y: 0 },
	down: false
};

const graph = {
	tick: {
		// The value of each tick marks
		value: { x: 1, y: 1 },

		// The amount of space between each tick marks
		space: {
			real: { x: 50, y: 50 },
			smooth: { x: 0, y: 0 }
		}
	},

	// Where the origin is from the center of the canvas
	origin: {
		real: { x: 0, y: 0 },
		smooth: { x: 0, y: 0 }
	},

	// The velocity of the graph
	velocity: { x: 0, y: 0 },

	// How far the graph will go out base on ticks
	border: {
		tick: { x: 10, y: 10 },

		get x() {
			return graph.tick.space.smooth.x*graph.border.tick.x;
		},

		get y() {
			return graph.tick.space.smooth.y*graph.border.tick.y;
		}
	},

	get x() {
		return width/2+graph.origin.smooth.x;
	},

	get y() {
		return height/2-graph.origin.smooth.y;
	}
};

const limit = (n, min, max) => Math.min(Math.max(n, min), max);

const drawXMarks = x => {
	// Grid
	C.lineWidth = settings.style.grid.width;
	C.strokeStyle = settings.style.grid.color;
	C.beginPath();
	C.moveTo(x, graph.y-graph.border.y);
	C.lineTo(x, graph.y+graph.border.y);
	C.stroke();

	// Ticks
	C.lineWidth = settings.style.tick.width;
	C.strokeStyle = settings.style.tick.color;
	C.beginPath();
	C.moveTo(x, graph.y-settings.style.tick.length);
	C.lineTo(x, graph.y+settings.style.tick.length);
	C.stroke();
};

const drawYMarks = y => {
	// Grid
	C.lineWidth = settings.style.grid.width;
	C.strokeStyle = settings.style.grid.color;
	C.beginPath();
	C.moveTo(graph.x-graph.border.x, y);
	C.lineTo(graph.x+graph.border.x, y);
	C.stroke();

	// Tick
	C.lineWidth = settings.style.tick.width;
	C.strokeStyle = settings.style.tick.color;
	C.beginPath();
	C.moveTo(graph.x-settings.style.tick.length, y);
	C.lineTo(graph.x+settings.style.tick.length, y);
	C.stroke();
};

// < Animation >
function animate() {
	requestAnimationFrame(animate);
	C.clearRect(0, 0, width, height);

	// Variables
	// / The amount of tick marks visible on the graph
	const tickAmount = {
		// The amount of tick marks from the left and top axises
		negative: {
			x: Math.min(Math.ceil(graph.x/graph.tick.space.smooth.x)+1, graph.border.tick.x),
			y: Math.min(Math.ceil(graph.y/graph.tick.space.smooth.y)+1, graph.border.tick.y)
		},

		// The amount of tick marks from the right and bottom axises
		positive: {
			x: Math.min(Math.ceil((width-graph.x)/graph.tick.space.smooth.x)+1, graph.border.tick.x),
			y: Math.min(Math.ceil((height-graph.y)/graph.tick.space.smooth.y)+1, graph.border.tick.y)
		}
	};

	// / The mouse coordinates in tick values
	const mouseTicks = {
		x: (-width/2-graph.origin.smooth.x+limit(mouse.smooth.x, graph.x-graph.border.x, graph.x+graph.border.x))/graph.tick.space.smooth.x*graph.tick.value.x,
		y: (height/2+graph.origin.smooth.y-limit(mouse.smooth.y, graph.y-graph.border.y, graph.y+graph.border.y))/graph.tick.space.smooth.y*graph.tick.value.y
	};

	// Draws the axises
	// / X
	C.beginPath();
	C.moveTo(0, graph.y);
	C.lineTo(width, graph.y);
	C.stroke();

	// / Y
	C.beginPath();
	C.moveTo(graph.x, 0);
	C.lineTo(graph.x, height);
	C.stroke();

	// Draws the ticks and grid
	// / X
	// / / Left
	for (let i = 1; i <= tickAmount.negative.x; i++) {
		drawXMarks(graph.x-graph.tick.space.smooth.x*i);
	}

	// / / Right
	for (let i = 1; i <= tickAmount.positive.x; i++) {
		drawXMarks(graph.x+graph.tick.space.smooth.x*i);
	}

	// / Y
	// / / Bottom
	for (let i = 1; i <= tickAmount.negative.y; i++) {
		drawYMarks(graph.y-graph.tick.space.smooth.y*i);
	}

	// / / Top
	for (let i = 1; i <= tickAmount.positive.y; i++) {
		drawYMarks(graph.y+graph.tick.space.smooth.y*i);
	}

	// Draws each lines in the array of equations
	C.lineWidth = settings.style.line.width;

	// / Loops and draws each lines inside the graph from left to right
	for (let equationIndex = 0; equationIndex < settings.equations.length; equationIndex++) {
		C.strokeStyle = settings.style.line.colors[equationIndex] || settings.style.line.defaultColor;

		// Where the line starts
		let start = {
			x: graph.x-graph.tick.space.smooth.x*tickAmount.negative.x,
			y: graph.y-graph.tick.space.smooth.y*(settings.equations[equationIndex](-tickAmount.negative.x*graph.tick.value.x)/graph.tick.value.y)
		};

		// Starts drawing from left to right
		for (let x = -tickAmount.negative.x*graph.tick.value.x; x <= tickAmount.positive.x*graph.tick.value.x; x += settings.step) {
			// Where the line ends
			const end = {
				x: graph.x+graph.tick.space.smooth.x*((x+settings.step)/graph.tick.value.x),
				y: graph.y-graph.tick.space.smooth.y*(settings.equations[equationIndex](x+settings.step)/graph.tick.value.y)
			};

			// If the line is inside the canvas and within borders
			if (start.y > 0 && start.y < height || end.y > 0 && end.y < height) {
				C.beginPath();
				C.moveTo(start.x, start.y);
				C.lineTo(end.x, end.y);
				C.stroke();
			}

			// The start of the line will be the end and the loop starts over
			start = end;
		}
	}

	// Draws the border
	if (settings.style.border.visible) {
		C.lineWidth = settings.style.border.width;
		C.strokeStyle = settings.style.border.color;
		C.beginPath();
		C.moveTo(graph.x-graph.border.x, graph.y-graph.border.y);
		C.lineTo(graph.x+graph.border.x, graph.y-graph.border.y);
		C.lineTo(graph.x+graph.border.x, graph.y+graph.border.y);
		C.lineTo(graph.x-graph.border.x, graph.y+graph.border.y);
		C.closePath();
		C.stroke();
	}

	// Draws each dots
	// / Loops through each equations in the array
	for (let i = 0; i < settings.equations.length; i++) {
		// The dot's y tick value which resulted from putting the mouse's value through the equation
		const y = settings.equations[i](mouseTicks.x);

		// Draws the dot
		C.lineWidth = settings.style.dot.outlineWidth;
		C.strokeStyle = 'black';
		C.fillStyle = settings.style.line.colors[i] || settings.style.line.defaultColor;
		C.beginPath();
		C.arc(limit(mouse.smooth.x, graph.x-graph.border.x, graph.x+graph.border.x), graph.y-graph.tick.space.smooth.y*y/graph.tick.value.y, settings.style.dot.radius, 0, Math.PI*2);
		C.stroke();
		C.fill();

		// Writes the y of the dot if it's valid
		C.fillText(
			Number.isSafeInteger(Math.round(y)) ?
				(y.toString()[0] === '-' ? '' : ' ') + y.toFixed(settings.decimalLength) :
				'NaN',
			2.5, settings.style.text.y+settings.style.text.space*(i+3)+settings.style.text.separator
		);
	}

	// Writes the mouse's tick coordinates
	C.fillStyle = 'black';
	C.fillText('x: ' + (mouseTicks.x.toString()[0] === '-' ? '' : ' ') + mouseTicks.x.toFixed(settings.decimalLength), settings.style.text.x, settings.style.text.y+settings.style.text.space);
	C.fillText('y: ' + (mouseTicks.y.toString()[0] === '-' ? '' : ' ') + mouseTicks.y.toFixed(settings.decimalLength), settings.style.text.x, settings.style.text.y+settings.style.text.space*2);

	// Saves the smooth mouse coordinates
	mouse.previous.x = mouse.smooth.x;
	mouse.previous.y = mouse.smooth.y;

	// Updates the smooth mouse coordinates
	mouse.smooth.x += (mouse.real.x-mouse.smooth.x)/settings.mouseEase;
	mouse.smooth.y += (mouse.real.y-mouse.smooth.y)/settings.mouseEase;

	// Updates the velocity of the mouse
	mouse.velocity.x = mouse.smooth.x-mouse.previous.x;
	mouse.velocity.y = mouse.smooth.y-mouse.previous.y;

	// Updates the graph's origin with the velocity if the mouse is down
	if (mouse.down) {
		graph.velocity.x = mouse.velocity.x;
		graph.velocity.y = mouse.velocity.y;
	} else {
		// Apply friction to the graph's velocity
		graph.velocity.x *= settings.friction;
		graph.velocity.y *= settings.friction;
	}

	// Makes the graph be able to be dragged by the mouse
	graph.origin.real.x += graph.velocity.x;
	graph.origin.real.y -= graph.velocity.y;

	// Smooths the zooming of the graph
	graph.tick.space.smooth.x += (graph.tick.space.real.x-graph.tick.space.smooth.x)/settings.zoomEase;
	graph.tick.space.smooth.y += (graph.tick.space.real.y-graph.tick.space.smooth.y)/settings.zoomEase;
	graph.origin.smooth.x += (graph.origin.real.x-graph.origin.smooth.x)/settings.zoomEase;
	graph.origin.smooth.y += (graph.origin.real.y-graph.origin.smooth.y)/settings.zoomEase;

	// Prevents the origin from going off the border
	graph.origin.real.x = limit(graph.origin.real.x, -graph.border.x, graph.border.x);
	graph.origin.real.y = limit(graph.origin.real.y, -graph.border.y, graph.border.y);

	// Updates the graph lines' smoothness depending on how far the graph is
	settings.step = width/2/graph.border.x*settings.lineSmoothness;
}

// < Events >
onmousemove = E => {
	[mouse.real.x, mouse.real.y] = [E.x, E.y];
};

onmousedown = () => {
	mouse.down = true;
};

onmouseup = () => {
	mouse.down = false;
};

onwheel = E => {
	if (E.deltaY < 0) {
		graph.origin.real.x += graph.origin.real.x*1.05-graph.origin.real.x;
		graph.origin.real.y += graph.origin.real.y*1.05-graph.origin.real.y;
		graph.tick.space.real.x *= 1.05;
		graph.tick.space.real.y *= 1.05;
	} else if (graph.tick.space.real.x > width/2/graph.border.tick.x/settings.zoomLimit && graph.tick.space.real.y > height/2/graph.border.tick.y/settings.zoomLimit) {
		graph.origin.real.x += graph.origin.real.x*0.95-graph.origin.real.x;
		graph.origin.real.y += graph.origin.real.y*0.95-graph.origin.real.y;
		graph.tick.space.real.x *= 0.95;
		graph.tick.space.real.y *= 0.95;
	}
};

onresize = function() {
	width = canvas.width = innerWidth;
	height = canvas.height = innerHeight;

	C.lineCap = 'round';
	C.font = settings.style.text.font;

	mouse.down = false;
};

onload = () => {
	console.log(`
"A Cartesian coordinate system is a coordinate system that specifies each point uniquely in a plane by a set of numerical coordinates, which are the signed distances to the point from two fixed perpendicular oriented lines, measured in the same unit of length. Each reference line is called a coordinate axis or just axis (plural axes) of the system, and the point where they meet is its origin, at ordered pair (0, 0). The coordinates can also be defined as the positions of the perpendicular projections of the point onto the two axes, expressed as signed distances from the origin."
(https://en.wikipedia.org/wiki/Cartesian_coordinate_system)


Each line in the graph represents a function in the array \`settings.equations\`. The first function will be red, second will be green, third will be blue, and the rest will be orange (Unless changed via the \`settings\` variable). The smoothness of each line will be determined by how close the graph is zoomed into. The more zoomed in the graph is, the more smooth each of the lines is, and vice versa. The coordinates of the mouse is displayed on the top left with black text. The numbers below represents the values of each functions with the color matching the text. You can modify the graph in \`./build/projects/Graphing-Calulator.js\` using the \`settings\` variable.

- Press and hold the mouse to drag the graph.
- Scroll the mouse wheel to zoom in/out.
`);

	document.title = 'Graphing Calculator';
	onresize();

	mouse.real.x = mouse.smooth.x = mouse.previous.x = graph.x;
	mouse.real.y = mouse.smooth.y = mouse.previous.y = graph.y;

	animate();
};
