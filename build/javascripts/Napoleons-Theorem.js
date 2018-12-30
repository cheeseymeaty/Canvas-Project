// < Declarations >
const canvas = document.querySelector('canvas');
const C = canvas.getContext('2d');

let { width, height } = canvas;

const settings = {
	style: {
		outline: 5,
		dotSize: 5,
		color: {
			// The color of the irregular triangle
			irregular: 'rgb(128, 128, 128)',

			// The color of the equilateral triangles
			equilaterals: 'rgba(128, 128, 128, 0.5)',

			// The color of the center equilateral triangle
			center: 'rgb(240, 240, 240)',

			// The color of the dots that's on the irregular triangle's vertexes
			irregularDots: 'rgb(255, 255, 0)',

			// The color of the dots that's on the center center equilateral triangle's vertexes
			centerDots: 'rgb(0, 255, 255)'
		}
	},

	mouseEase: 5,
	vertexEase: 5,

	// How close the mouse has to be to a irregular triangle's vertex to select it
	selectVertexRadius: 50
};

const mouse = {
	real: { x: null, y: null },
	smooth: { x: null, y: null },
	velocity: { x: null, y: null },
	down: false,

	// What vertex of the irregular triangle the mouse has selected
	selected: null
};

// The vertexes of the irregular triangle
const vertexes = new Array(3)
	.fill(null)
	.map(() => {
		return {
			real: { x: null, y: null },
			smooth: { x: null, y: null },
			velocity: { x: null, y: null }
		};
	});

// < Animation >
function animate() {
	requestAnimationFrame(animate);
	C.clearRect(0, 0, width, height);

	// Variables
	// / The coordinate differences from one vertex to the next one in the irregular triangle
	const differences = [];

	// / The properties of each equilateral triangles
	const equilaterals = [];

	// / Calculates the values for differences and equilaterals
	for (let i = 0; i < 3; i++) {
		const vertex = vertexes[i];
		const nextVertex = vertexes[(i+1)%3];

		// Pushes the object into the differences array
		differences.push({
			x: vertex.smooth.x-nextVertex.smooth.x,
			y: vertex.smooth.y-nextVertex.smooth.y
		});

		// The distance between the vertexes
		const hypot = Math.hypot(differences[i].x, differences[i].y);

		// The angle between the vertexes
		const theta = (vertex.smooth.y < nextVertex.smooth.y ? -2 : 1)/3*Math.PI-Math.atan(differences[i].x/differences[i].y);

		const equilateral = {
			// The two vertexes
			vertex, nextVertex,

			// The coordinates of the other vertex in the equilateral triangle that's not a part of the irregular triangle
			x: vertex.smooth.x+Math.sin(theta)*hypot,
			y: vertex.smooth.y-Math.cos(theta)*hypot
		};

		// The coordinates of the center of the equilateral triangle
		equilateral.center = {
			x: (vertex.smooth.x+equilateral.x+nextVertex.smooth.x)/3,
			y: (vertex.smooth.y+equilateral.y+nextVertex.smooth.y)/3
		};

		// Pushes the equilateral triangle into the array
		equilaterals.push(equilateral);
	}

	// Draws the lines that intersects the center of each equilateral triangle
	for (const equilateral of equilaterals) {
		// From the top vertex to the bottom side
		C.beginPath();
		C.moveTo(equilateral.x, equilateral.y);
		C.lineTo((equilateral.vertex.smooth.x+equilateral.nextVertex.smooth.x)/2, (equilateral.vertex.smooth.y+equilateral.nextVertex.smooth.y)/2);
		C.stroke();

		// From the left vertex to the right side
		C.beginPath();
		C.moveTo(equilateral.nextVertex.smooth.x, equilateral.nextVertex.smooth.y);
		C.lineTo((equilateral.x+equilateral.vertex.smooth.x)/2, (equilateral.y+equilateral.vertex.smooth.y)/2);
		C.stroke();

		// From the right vertex to the left side
		C.beginPath();
		C.moveTo(equilateral.vertex.smooth.x, equilateral.vertex.smooth.y);
		C.lineTo((equilateral.x+equilateral.nextVertex.smooth.x)/2, (equilateral.y+equilateral.nextVertex.smooth.y)/2);
		C.stroke();
	}

	// Draws each equilateral triangle
	C.fillStyle = settings.style.color.equilaterals;
	for (const equilateral of equilaterals) {
		// Fills the triangle
		C.beginPath();
		C.moveTo(equilateral.vertex.smooth.x, equilateral.vertex.smooth.y);
		C.lineTo(equilateral.nextVertex.smooth.x, equilateral.nextVertex.smooth.y);
		C.lineTo(equilateral.x, equilateral.y);
		C.closePath();
		C.fill();

		// Outlines the triangle
		// / From the irregular triangle's vertex to the equilateral triangle's outer vertex
		C.beginPath();
		C.moveTo(equilateral.vertex.smooth.x, equilateral.vertex.smooth.y);
		C.lineTo(equilateral.x, equilateral.y);
		C.stroke();

		// / From the equilateral triangle's outer vertex to the next irregular triangle's vertex
		C.beginPath();
		C.moveTo(equilateral.x, equilateral.y);
		C.lineTo(equilateral.nextVertex.smooth.x, equilateral.nextVertex.smooth.y);
		C.stroke();

		// / From the next irregular triangle's vertex back to the first one
		C.beginPath();
		C.moveTo(equilateral.nextVertex.smooth.x, equilateral.nextVertex.smooth.y);
		C.lineTo(equilateral.x, equilateral.y);
		C.stroke();
	}

	// Fills the irregular triangle
	C.fillStyle = settings.style.color.irregular;
	C.beginPath();
	C.moveTo(vertexes[0].smooth.x, vertexes[0].smooth.y);
	C.lineTo(vertexes[1].smooth.x, vertexes[1].smooth.y);
	C.lineTo(vertexes[2].smooth.x, vertexes[2].smooth.y);
	C.closePath();
	C.fill();

	// Outlines the irregular triangle
	for (const equilateral of equilaterals) {
		C.beginPath();
		C.moveTo(equilateral.vertex.smooth.x, equilateral.vertex.smooth.y);
		C.lineTo(equilateral.nextVertex.smooth.x, equilateral.nextVertex.smooth.y);
		C.stroke();
	}

	// Draws a dot at each vertex of the irregular triangle
	for (const equilateral of equilaterals) {
		C.lineWidth *= 2;
		C.fillStyle = settings.style.color.irregularDots;
		C.beginPath();
		C.arc(equilateral.vertex.smooth.x, equilateral.vertex.smooth.y, settings.style.dotSize, 0, Math.PI*2);
		C.stroke();
		C.fill();
		C.lineWidth /= 2;
	}

	// Fills the center equilateral triangle
	C.fillStyle = settings.style.color.center;
	C.beginPath();
	C.moveTo(equilaterals[0].center.x, equilaterals[0].center.y);
	C.lineTo(equilaterals[1].center.x, equilaterals[1].center.y);
	C.lineTo(equilaterals[2].center.x, equilaterals[2].center.y);
	C.closePath();
	C.fill();

	// Outlines the center equilateral triangle
	for (let i = 0; i < 3; i++) {
		C.beginPath();
		C.moveTo(equilaterals[i].center.x, equilaterals[i].center.y);
		C.lineTo(equilaterals[(i+1)%3].center.x, equilaterals[(i+1)%3].center.y);
		C.stroke();
	}

	// Draws a dot at each vertex of the center equilateral triangle
	for (const equilateral of equilaterals) {
		C.lineWidth *= 2;
		C.fillStyle = settings.style.color.centerDots;
		C.beginPath();
		C.arc(equilateral.center.x, equilateral.center.y, settings.style.dotSize, 0, Math.PI*2);
		C.stroke();
		C.fill();
		C.lineWidth /= 2;
	}

	// Updates the mouse's coordinates and velocity
	mouse.smooth.x += mouse.velocity.x = (mouse.real.x-mouse.smooth.x)/settings.mouseEase;
	mouse.smooth.y += mouse.velocity.y = (mouse.real.y-mouse.smooth.y)/settings.mouseEase;

	// Updates all of the irregular triangle's vertexes coordinates and velocity
	for (const vertex of vertexes) {
		vertex.smooth.x += vertex.velocity.x = (vertex.real.x-vertex.smooth.x)/settings.vertexEase;
		vertex.smooth.y += vertex.velocity.y = (vertex.real.y-vertex.smooth.y)/settings.vertexEase;

		if (!mouse.selected) {
			// Limit the coordinates to be inside the canvas
			vertex.real.x = Math.min(Math.max(vertex.real.x, settings.style.dotSize+C.lineWidth), width-settings.style.dotSize-C.lineWidth);
			vertex.real.y = Math.min(Math.max(vertex.real.y, settings.style.dotSize+C.lineWidth), height-settings.style.dotSize-C.lineWidth);
		}
	}

	// Updates the selected vertex's coordinates
	if (mouse.selected) {
		// Make the selected vertex go towards the mouse
		mouse.selected.real.x += (mouse.smooth.x-mouse.selected.smooth.x)/settings.vertexEase+mouse.velocity.x;
		mouse.selected.real.y += (mouse.smooth.y-mouse.selected.smooth.y)/settings.vertexEase+mouse.velocity.y;
	}
}

// < Events >
onmousemove = E => {
	[mouse.real.x, mouse.real.y] = [E.x, E.y];
};

onmousedown = () => {
	mouse.down = true;

	// Checks if the mouse has clicked near any of the irregular triangle's vertexes
	for (const vertex of vertexes) {
		if (Math.hypot(vertex.smooth.x-mouse.smooth.x, vertex.smooth.y-mouse.smooth.y) < settings.selectVertexRadius) {
			mouse.selected = vertex;
		}
	}
};

onmouseup = () => {
	mouse.down = false;
	mouse.selected = null;
};

onresize = function() {
	width = canvas.width = innerWidth;
	height = canvas.height = innerHeight;

	C.lineWidth = settings.style.outline;
	C.lineCap = 'round';

	onmouseup();
};

onload = () => {
	console.log(`
"In geometry, Napoleon's theorem states that if equilateral triangles are constructed on the sides of any triangle, either all outward or all inward, the lines connecting the centres of those equilateral triangles themselves form an equilateral triangle. The triangle thus formed is called the inner or outer Napoleon triangle. The difference in area of these two triangles equals the area of the original triangle."
(https://en.wikipedia.org/wiki/Napoleon's_theorem)
(https://www.youtube.com/watch?v=KQ8cSuoopyc)


The irregular triangle has an equilateral triangle on all of its sides. When the center of these triangles are connected, they will form another equilateral triangle. This will happen regardless of the inital irregular triangle.

- Press and hold on a yellow dot or one of the vertex of the irregular triangle to move it.
`);

	document.title = 'Napoleon\'s theorem';
	onresize();

	// Make each vertex of the irregular triangle be in a random spot on the canvas
	for (const vertex of vertexes) {
		vertex.real.x = vertex.smooth.x = Math.random()*width;
		vertex.real.y = vertex.smooth.y = Math.random()*height;
	}

	animate();
};
