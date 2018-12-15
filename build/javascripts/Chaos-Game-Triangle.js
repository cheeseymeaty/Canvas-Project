// < Declarations >
const canvas = document.querySelector('canvas');
const C = canvas.getContext('2d');

let { width, height } = canvas;

const settings = {
	paused: true,
	style: {
		fontSize: 25,
		dotSize: 1,
		triangleLineWidth: 5
	}
};

const keyboard = {
	space: false,
	r: false
};

const triangle = {
	rx: 0.5, ry: 0.5,
	length: 500
};

triangle.height = Math.sqrt(triangle.length**2-(triangle.length/2)**2);
triangle.vertex = [
	// Top
	{ x: 0, y: -triangle.height/2 },

	// Left
	{ x: -triangle.length/2, y: triangle.height/2 },

	// Right
	{ x: triangle.length/2, y: triangle.height/2 }
];

const dot = {
	// The amount of dots that could be made before stopping
	limit: 2500,

	// Array of all the dots
	array: [{ x: 0, y: 0 }],

	// Creates a new dot in the array
	add: () => {
		const randomVertex = triangle.vertex[Math.floor(Math.random()*3)];
		const previousDot = dot.array[dot.array.length-1];

		// Pushes a new dot in the array with the average coordinates of a random vertex and the previous dot
		dot.array.push({
			x: (previousDot.x+randomVertex.x)/2,
			y: (previousDot.y+randomVertex.y)/2
		});
	}
};

// Resets the program to only have one dot and is paused
const reset = () => {
	dot.array = [dot.array[0]];
	settings.paused = true;
};

// < Animation >
function animate() {
	requestAnimationFrame(animate);
	C.clearRect(0, 0, width, height);

	// Draws triangle from vertex to vertex
	// / Top to Left
	C.beginPath();
	C.moveTo(width*triangle.rx+triangle.vertex[0].x, height*triangle.ry+triangle.vertex[0].y);
	C.lineTo(width*triangle.rx+triangle.vertex[1].x, height*triangle.ry+triangle.vertex[1].y);
	C.stroke();

	// / Left to Right
	C.beginPath();
	C.moveTo(width*triangle.rx+triangle.vertex[1].x, height*triangle.ry+triangle.vertex[1].y);
	C.lineTo(width*triangle.rx+triangle.vertex[2].x, height*triangle.ry+triangle.vertex[2].y);
	C.stroke();

	// / Right to Top
	C.beginPath();
	C.moveTo(width*triangle.rx+triangle.vertex[2].x, height*triangle.ry+triangle.vertex[2].y);
	C.lineTo(width*triangle.rx+triangle.vertex[0].x, height*triangle.ry+triangle.vertex[0].y);
	C.stroke();

	// Draws each dot
	for (const point of dot.array) {
		C.beginPath();
		C.arc(
			width*triangle.rx+point.x,
			height*triangle.ry+point.y,
			settings.style.dotSize,
			0, Math.PI*2
		);
		C.fill();
	}

	// Writes the amount of dots
	C.beginPath();
	C.fillText(
		dot.array.length, width*triangle.rx,
		Math.max(
			height*triangle.ry+triangle.height/2+settings.style.fontSize,
			(height+height*triangle.ry+triangle.height/2)/2
		)
	);

	// Creates a new dot if it's still below the limit and the program is not paused
	if (dot.array.length < dot.limit && !settings.paused) {
		dot.add();
	}
}

// < Events >
onkeydown = E => {
	// Switch case for key presses
	switch (E.code) {
		case 'Space':
			keyboard.space = true;
			break;

		case 'KeyR':
			keyboard.r = true;
			break;
	}
};

onkeyup = E => {
	// If space was pressed, it'll pause the program
	if (keyboard.space) {
		settings.paused = !settings.paused;
	}

	// If key r was pressed, reset the program
	if (keyboard.r) {
		reset();
	}

	// Switch case for key releases
	switch (E.code) {
		case 'Space':
			keyboard.space = false;
			break;

		case 'KeyR':
			keyboard.r = false;
			break;
	}
};

onresize = function() {
	width = canvas.width = innerWidth;
	height = canvas.height = innerHeight;

	C.lineWidth = settings.style.triangleLineWidth;
	C.lineCap = 'round';
	C.font = settings.style.fontSize + 'px "Roboto Mono"';
	C.textBaseline = 'middle';
	C.textAlign = 'center';
};

onload = () => {
	console.log(`
"In mathematics, the term chaos game originally referred to a method of creating a fractal, using a polygon and an initial point selected at random inside it. The fractal is created by iteratively creating a sequence of points, starting with the initial random point, in which each point in the sequence is a given fraction of the distance between the previous point and one of the vertices of the polygon; the vertex is chosen at random in each iteration."
(https://en.wikipedia.org/wiki/Chaos_game)


A Sierpinski Triangle can be formed with chaos game through the following steps:
	1. Create a random point inside an equilateral triangle.
	2. Pick a random vertex of the triangle.
	3. Make another point between the said vertex and previous point.
	4. Repeat and the fractal appears.

The program produces dots inside the triangle every frame unless it is paused or reached its limit (2500 by default).

- Press "Space" to start/pause the program.
- Press "R" to reset.
`);

	document.title = 'Chaos Game: Triangle';
	onresize();
	animate();
};
