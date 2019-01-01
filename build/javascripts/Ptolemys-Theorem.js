// < Declarations >
const canvas = document.querySelector('canvas');
const C = canvas.getContext('2d');

let { width, height } = canvas;

const settings = {
	style: {
		lineWidth: 5,

		text: {
			outline: 3,
			spaceFromShortest: 10,
			spaceFromLongest: 10,
			font: '20px "Roboto Mono"'
		},

		lines: {
			colors: [
				'rgb(255, 0, 0)',
				'rgb(0, 255, 0)',
				'rgb(0, 0, 255)'
			],

			width: 5,
			outline: 10,
			spaceFromShortest: 15,
			spaceFromLongest: 30
		},

		point: {
			radius: 5,
			outline: 7.5,
			color: 'rgb(255, 255, 0)'
		}
	},

	mouseEase: 5,
	dotEase: 5,

	orbit: -Math.PI/2,
	orbitSpeed: 0.005
};

const mouse = {
	real: { x: null, y: null },
	smooth: { x: null, y: null },
	inner: { x: null, y: null },
	inCircle: false
};

const point = {
	real: { x: 0, y: 0 },
	smooth: { x: 0, y: 0 }
};

const circle = {
	radius: 250,

	get x() {
		return width/2;
	},

	get y() {
		return height/2;
	}
};


const vertexes = (() => {
	// The length of the triangle's sides
	const side = Math.sin(1/3*Math.PI)*circle.radius;

	// The distance from the center of the circle to the base of the triangle
	const offset = Math.sin(1/6*Math.PI)*circle.radius;

	return [
		// Top
		{ x: 0, y: -circle.radius },

		// Left
		{ x: -side, y: offset },

		// Right
		{ x: side, y: offset }
	];
})();

// < Animation >
function animate() {
	requestAnimationFrame(animate);
	C.clearRect(0, 0, width, height);

	// Variables
	// / The coordinate differences of the circle's and mouse's
	const differences = {
		x: mouse.inner.x-circle.x,
		y: mouse.inner.y-circle.y
	};

	// / The ratio that'll make the point's coordinates be on the circle's circumference
	const ratio = circle.radius/Math.hypot(differences.x, differences.y);

	// / The length of each lines
	const lines = new Array(3)
		.fill(null)
		.map((_, i) => {
			return { distance: Math.hypot(vertexes[i].x-point.smooth.x, vertexes[i].y-point.smooth.y), index: i };
		});

	// / The longest line
	const longestLine = lines.reduce((longest, line) => longest.distance < line.distance ? line : longest, lines[0]);

	// / The other two smaller lines
	const shorterLines = lines.filter(line => line.index !== longestLine.index);

	// Draws the circle
	C.lineWidth = settings.style.lineWidth;
	C.strokeStyle = 'black';
	C.beginPath();
	C.arc(circle.x, circle.y, circle.radius, 0, Math.PI*2);
	C.stroke();

	// Draws the triangle
	for (let i = 0; i < 3; i++) {
		C.lineWidth = settings.style.lineWidth;
		C.strokeStyle = 'black';
		C.beginPath();
		C.moveTo(circle.x+vertexes[i].x, circle.y+vertexes[i].y);
		C.lineTo(circle.x+vertexes[(i+1)%3].x, circle.y+vertexes[(i+1)%3].y);
		C.stroke();
	}

	// Draws each line going from the vertexes to the point
	for (let i = 0; i < 3; i++) {
		// Outline
		C.lineWidth = settings.style.lines.outline;
		C.strokeStyle = 'black';
		C.beginPath();
		C.moveTo(circle.x+vertexes[i].x, circle.y+vertexes[i].y);
		C.lineTo(circle.x+point.smooth.x, circle.y+point.smooth.y);
		C.stroke();

		// Line
		C.lineWidth = settings.style.lines.width;
		C.strokeStyle = settings.style.lines.colors[i];
		C.stroke();
	}

	// Draws the length of the two smaller lines and write their lengths
	// / The overall length of the lines divided by two
	const overall = shorterLines.reduce((totalLength, line) => totalLength+line.distance, 0)/2;

	// / Draws and write both lines
	for (let i = 0, total = 0; i < shorterLines.length; (total += shorterLines[i].distance) && i++) {
		const line = shorterLines[i];
		const y = circle.y+circle.radius+settings.style.lines.spaceFromShortest;

		// Outline
		C.lineWidth = settings.style.lines.outline;
		C.strokeStyle = 'black';
		C.beginPath();
		C.moveTo(circle.x-overall+total, y);
		C.lineTo(circle.x-overall+total+line.distance, y);
		C.stroke();

		// Line
		C.lineWidth = settings.style.lines.width;
		C.strokeStyle = settings.style.lines.colors[line.index];
		C.stroke();

		// Writes the length
		const text = {
			string: Math.round(line.distance),
			x: circle.x+(overall+settings.style.text.spaceFromShortest)*(i === 0 ? -1 : 1)
		};

		C.lineWidth = settings.style.text.outline;
		C.textAlign = i ? 'left' : 'right';
		C.textBaseline = 'middle';
		C.strokeStyle = 'black';
		C.fillStyle = settings.style.lines.colors[line.index];
		C.beginPath();
		C.strokeText(text.string, text.x, y);
		C.fillText(text.string, text.x, y);
	}

	// Draws the longest line and writes its length
	// / The y coordinate when drawing the line
	const longestY = circle.y+circle.radius+settings.style.lines.spaceFromLongest;

	// / Outline
	C.lineWidth = settings.style.lines.outline;
	C.strokeStyle = 'black';
	C.beginPath();
	C.moveTo(circle.x-longestLine.distance/2, longestY);
	C.lineTo(circle.x+longestLine.distance/2, longestY);
	C.stroke();

	// / Line
	C.lineWidth = settings.style.lines.width;
	C.fillStyle = C.strokeStyle = settings.style.lines.colors[longestLine.index];
	C.stroke();

	// / Writes length
	C.lineWidth = settings.style.text.outline;
	C.textAlign = 'center';
	C.textBaseline = 'top';
	C.strokeStyle = 'black';
	C.fillStyle = settings.style.lines.colors[longestLine.index];
	C.beginPath();
	C.strokeText(Math.round(longestLine.distance), circle.x, longestY+settings.style.text.spaceFromLongest);
	C.fillText(Math.round(longestLine.distance), circle.x, longestY+settings.style.text.spaceFromLongest);

	// Draws the point
	C.lineWidth = settings.style.point.outline;
	C.strokeStyle = 'black';
	C.fillStyle = settings.style.point.color;
	C.beginPath();
	C.arc(circle.x+point.smooth.x, circle.y+point.smooth.y, settings.style.point.radius, 0, Math.PI*2);
	C.stroke();
	C.fill();

	// Updates the smooth mouse coordinates
	mouse.smooth.x += (mouse.real.x-mouse.smooth.x)/settings.mouseEase;
	mouse.smooth.y += (mouse.real.y-mouse.smooth.y)/settings.mouseEase;

	// Updates the real coordinates of the point
	point.real.x = differences.x*ratio;
	point.real.y = differences.y*ratio;

	// Updates the smooth coordinates of the point
	point.smooth.x += (point.real.x-point.smooth.x)/settings.dotEase;
	point.smooth.y += (point.real.y-point.smooth.y)/settings.dotEase;

	// If the mouse is inside the circle
	if (mouse.inCircle) {
		// Make the inner mouse coordinates the same as the smooth ones
		mouse.inner.x = mouse.smooth.x;
		mouse.inner.y = mouse.smooth.y;
	} else {
		// Make the inner mouse coordinates orbit along the circle's circumference
		mouse.inner.x = circle.x+Math.cos(settings.orbit)*circle.radius;
		mouse.inner.y = circle.y+Math.sin(settings.orbit)*circle.radius;
		settings.orbit += settings.orbitSpeed;
	}
}

// < Events >
onmousemove = E => {
	[mouse.real.x, mouse.real.y] = [E.x, E.y];

	// Updates on whether the mouse is inside the circle or not
	mouse.inCircle = Math.hypot(mouse.real.x-circle.x, mouse.real.y-circle.y) <= circle.radius;
};

onresize = function() {
	width = canvas.width = innerWidth;
	height = canvas.height = innerHeight;

	C.lineCap = 'round';
	C.font = settings.style.text.font;

	mouse.inCircle = false;
};

onload = () => {
	console.log(`
"Ptolemy's Theorem yields as a corollary a pretty theorem regarding an equilateral triangle inscribed in a circle. Given: An equilateral triangle inscribed on a circle and a point on the circle. The distance from the point to the most distant vertex of the triangle is the sum of the distances from the point to the two nearer vertices."
(https://en.wikipedia.org/wiki/Ptolemy%27s_theorem)


This project is a visual and interactive demostration of Ptolemy's Theorem. The two smallest lines will add up to the longest one (Might be slightly off due to rounding).

- Move the mouse inside the circle to move the point.
- Move the mouse outside of the circle to make the point orbit.
`);

	document.title = 'Ptolemy\'s Theorem';
	onresize();
	animate();
};
