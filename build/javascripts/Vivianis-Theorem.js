// < Declarations >
const canvas = document.querySelector('canvas');
const C = canvas.getContext('2d');

let { width, height } = canvas;

const settings = {
	style: {
		lineWidth: 5,

		text: {
			outline: 3,
			miterLimit: 3,
			space: 10,
			font: '20px "Roboto Mono"'
		},

		lines: {
			x: -25,
			outlineWidth: 10,
			colors: [
				'rgb(255, 0, 0)',
				'rgb(0, 255, 0)',
				'rgb(0, 0, 255)'
			]
		},

		dot: {
			radius: 5,
			outlineWidth: 5,
			drag: 5,
			color: 'rgb(128, 128, 128)'
		}
	}
};

const mouse = {
	// The actual mouse coordinates
	real: { x: null, y: null },

	// The coordinates inside the triangle
	inner: { x: null, y: null },

	// The eased version of the inner coordinates
	smooth: { x: null, y: null },

	// Boolean on whether the mouse is inside the triangle or not
	inside: false
};

const orbit = {
	// Current orbit angle
	counter: 0,

	// The speed at which the dot orbits
	speed: 0.005,

	// How fasts the orbit's path fades in when the mouse is outside the triangle
	fadeInSpeed: 0.001,

	// How fasts the orbit's path fades out when the mouse is inside the triangle
	fadeOutSpeed: 0.1,

	// The current opacity of the orbit's path
	opacity: 0,

	// The maximum opacity
	limit: 0.5,

	// The color of the path ('%s' will be replaced by the current opacity)
	color: 'rgba(128, 128, 128, %s)'
};

const triangle = {
	rx: 0.5, ry: 0.5,
	length: 500,

	get x() {
		return width*triangle.rx;
	},

	get y() {
		return height*triangle.ry;
	}
};

triangle.height = Math.sqrt(triangle.length**2-(triangle.length/2)**2);
triangle.vertex = [
	// Top
	{
		get x() {
			return triangle.x;
		},

		get y() {
			return triangle.y-triangle.height/2;
		}
	},

	// Left
	{
		get x() {
			return triangle.x-triangle.length/2;
		},

		get y() {
			return triangle.y+triangle.height/2;
		}
	},

	// Right
	{
		get x() {
			return triangle.x+triangle.length/2;
		},

		get y() {
			return triangle.y+triangle.height/2;
		}
	}
];

// This radius value will make the orbit path touch all sides of the triangle without making the dot leaving it
orbit.radius = Math.tan(30*(Math.PI/180))*(triangle.length/2);

// The offset is the difference between the center of the triangle and the triangle's y value
orbit.offset = (triangle.vertex[0].y+triangle.vertex[1].y+triangle.vertex[2].y)/3-triangle.y;

// Makes the mouse coordinates inside the triangle to follow the orbit
const mouseToOrbit = () => {
	mouse.inner.x = triangle.x+Math.cos(orbit.counter)*orbit.radius;
	mouse.inner.y = triangle.y+orbit.offset+Math.sin(orbit.counter)*orbit.radius;
};

// < Animation >
function animate() {
	requestAnimationFrame(animate);
	C.clearRect(0, 0, width, height);

	// Variables
	// / The distance from the first vertex to mouse
	const distance = Math.hypot(mouse.smooth.x-triangle.vertex[0].x, mouse.smooth.y-triangle.vertex[0].y);

	// / The angle from the first vertex to mouse
	const angle = Math.asin((mouse.smooth.x-triangle.vertex[0].x)/distance);

	// / The length of each line
	const length = [
		// Left
		Math.sin(30*(Math.PI/180)+angle)*distance,

		// Right
		Math.sin(30*(Math.PI/180)-angle)*distance,

		// Bottom
		triangle.y+triangle.height/2-mouse.smooth.y
	];

	// / The coordinates of each line endings
	const lines = [
		// Left
		{
			x: mouse.smooth.x-Math.cos(30*(Math.PI/180))*length[0],
			y: mouse.smooth.y-Math.sin(30*(Math.PI/180))*length[0]
		},

		// Right
		{
			x: mouse.smooth.x+Math.cos(30*(Math.PI/180))*length[1],
			y: mouse.smooth.y-Math.sin(30*(Math.PI/180))*length[1]
		},

		// Bottom
		{
			x: mouse.smooth.x,
			y: mouse.smooth.y+length[2]
		}
	];

	// / The x value of where the line total will be drawn
	const lineTotalX = triangle.x-triangle.length/2+settings.style.lines.x;

	// Draws triangle
	for (let i = 0; i < triangle.vertex.length; i++) {
		C.strokeStyle = 'black';
		C.beginPath();
		C.moveTo(triangle.vertex[i].x, triangle.vertex[i].y);
		C.lineTo(triangle.vertex[(i+1)%triangle.vertex.length].x, triangle.vertex[(i+1)%triangle.vertex.length].y);
		C.stroke();
	}

	// Draws the path of the orbit
	C.strokeStyle = orbit.color.replace('%s', orbit.opacity);
	C.beginPath();
	C.arc(triangle.x, triangle.y+orbit.offset, orbit.radius, 0, Math.PI*2);
	C.stroke();

	// Draw each lines and their total length
	for (let i = 0; i < length.length; i++) {
		const start = triangle.y+triangle.height/2-length.slice(0, i).reduce((sum, num) => sum+num, 0);
		const end = start-length[i];

		// Draws the line inside the triangle
		// / Outline
		C.lineWidth = settings.style.lines.outlineWidth;
		C.strokeStyle = 'black';
		C.beginPath();
		C.moveTo(mouse.smooth.x, mouse.smooth.y);
		C.lineTo(lines[i].x, lines[i].y);
		C.stroke();

		// / Line
		C.lineWidth = settings.style.lineWidth;
		C.strokeStyle = settings.style.lines.colors[i];
		C.stroke();

		// Draws the line showing the total length
		// / Outline
		C.lineWidth = settings.style.lines.outlineWidth;
		C.strokeStyle = 'black';
		C.beginPath();
		C.moveTo(lineTotalX, start);
		C.lineTo(lineTotalX, end);
		C.stroke();

		// / Line
		C.lineWidth = settings.style.lineWidth;
		C.strokeStyle = settings.style.lines.colors[i];
		C.stroke();

		// Writes the length of the line
		C.lineWidth = settings.style.text.outline;
		C.strokeStyle = 'black';
		C.fillStyle = settings.style.lines.colors[i];
		C.beginPath();
		C.strokeText(Math.round(length[i]), lineTotalX-settings.style.text.space, (start+end)/2);
		C.fillText(Math.round(length[i]), lineTotalX-settings.style.text.space, (start+end)/2);
		C.lineWidth = settings.style.lineWidth;
	}

	// Draws a dot at the mouse with smooth coordinates inside the triangle
	C.lineWidth = settings.style.dot.outlineWidth;
	C.strokeStyle = 'black';
	C.fillStyle = settings.style.dot.color;
	C.beginPath();
	C.arc(mouse.smooth.x, mouse.smooth.y, settings.style.dot.radius, 0, Math.PI*2);
	C.stroke();
	C.fill();
	C.lineWidth = settings.style.lineWidth;

	// If the mouse is outside the triangle, the dot will start orbiting its path
	if (!mouse.inside) {
		mouseToOrbit();
		orbit.counter += orbit.speed;
	}

	// Updates the smooth mouse coordinates so it'll ease towards the real coordinates
	mouse.smooth.x += (mouse.inner.x-mouse.smooth.x)/settings.style.dot.drag;
	mouse.smooth.y += (mouse.inner.y-mouse.smooth.y)/settings.style.dot.drag;

	// Updates the opacity of the orbit's path
	if (mouse.inside) {

		// The opacity will decrease until it hits zero
		orbit.opacity = Math.max(0, orbit.opacity-orbit.fadeOutSpeed);
	} else {

		// The opacity will increase until it hits the limit
		orbit.opacity = Math.min(orbit.limit, orbit.opacity+orbit.fadeInSpeed);
	}
}

// < Events >
onmousemove = E => {
	[mouse.real.x, mouse.real.y] = [E.x, E.y];

	// Updates on whether the mouse is inside the triangle or not
	mouse.inside =
		// If the mouse is above the bottom of the triangle
		mouse.real.y <= triangle.y+triangle.height/2 &&

		// If the mouse is below the top of the triangle
		mouse.real.y >= triangle.y-triangle.height/2 &&

		// If the mouse is inside the triangle
		Math.abs(Math.hypot(mouse.real.x-triangle.vertex[0].x, mouse.real.y-triangle.vertex[0].y)/(mouse.real.x-triangle.x)) >= 2;

	// If the mouse is inside the triangle
	if (mouse.inside) {
		[mouse.inner.x, mouse.inner.y] = [E.x, E.y];
	}
};

onresize = function() {
	width = canvas.width = innerWidth;
	height = canvas.height = innerHeight;

	// Prevents the dot from clipping out of the triangle when resizing
	mouseToOrbit();
	mouse.inside = false;
	[mouse.smooth.x, mouse.smooth.y] = [mouse.inner.x, mouse.inner.y];

	C.lineWidth = settings.style.lineWidth;
	C.lineCap = 'round';
	C.font = settings.style.text.font;
	C.textBaseline = 'middle';
	C.textAlign = 'right';
	C.miterLimit = settings.style.text.miterLimit;
};

onload = () => {
	console.log(`
"Viviani's theorem, named after Vincenzo Viviani, states that the sum of the distances from any interior point to the sides of an equilateral triangle equals the length of the triangle's altitude."
(https://en.wikipedia.org/wiki/Viviani%27s_theorem)


All of the red, green, and blue lines, when added all up, will equal the total height of the triangle. No illusions here.

- Move the mouse inside the triangle to move the dot.
- Move the mouse outside the triangle to make it orbit the triangle's center.
`);

	document.title = 'Viviani\'s Theorem';
	onresize();
	mouseToOrbit();
	animate();
};
