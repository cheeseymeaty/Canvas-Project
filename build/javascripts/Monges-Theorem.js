// < Declarations >
const canvas = document.querySelector('canvas');
const C = canvas.getContext('2d');

let { width, height } = canvas;

const settings = {
	style: {
		lineWidth: 2.5,
		outlineWidth: 7.5,
		contactLineColor: 'rgb(255, 255, 0)',
		tangentLineColor: 'rgb(128, 128, 128)',
		circleColors: [
			'rgb(255, 0, 0)',
			'rgb(0, 255, 0)',
			'rgb(0, 0, 255)'
		]
	}
};

const mouse = {
	// The actual mouse coordinates
	real: { x: null, y: null },

	// The smooth version of the mouse coordinates
	smooth: { x: null, y: null },

	// The previous value of the smooth mouse coordinates
	previous: { x: null, y: null },

	// The velocity of the smooth mouse
	velocity: { x: 0, y: 0 },

	// If the mouse has selected a circle
	selected: null
};

const circles = [
	// Large
	{ rx: Math.random(), ry: Math.random(), radius: 100 },

	// Medium
	{ rx: Math.random(), ry: Math.random(), radius: 50 },

	// Small
	{ rx: Math.random(), ry: Math.random(), radius: 25 }
];

// Makes all of the circles have an x and y getters that'll return their actual coordinates
for (const circle of circles) {
	Object.defineProperties(circle, {
		x: {
			get() {
				return width*this.rx;
			}
		},

		y: {
			get() {
				return height*this.ry;
			}
		}
	});
}

// Finds the angle going from circle "a" to circle "b"
const findAngle = (a, b) => Math.atan((circles[a].x-circles[b].x)/(circles[a].y-circles[b].y));

// Calculates the contact point of the given angle and a circle's index
const findTangent = (index, angle) => {
	const x = Math.cos(angle)*circles[index].radius;
	const y = Math.sin(angle)*circles[index].radius;

	return [
		{ x: circles[index].x-x, y: circles[index].y+y },
		{ x: circles[index].x+x, y: circles[index].y-y }
	];
};

// Calculates the contact point using two circle's indexes and their angle
const findContact = (a, b, angle) => {
	a = circles[a];
	b = circles[b];
	const hypot = a.radius*Math.hypot(a.x-b.x, a.y-b.y)/(a.radius-b.radius)*(a.y < b.y ? -1 : 1);

	return {
		x: Math.sin(angle)*hypot,
		y: Math.cos(angle)*hypot
	};
};

// Prevents a circle's coordinate from going off screen
const limit = circle => {
	circle.rx = Math.min(Math.max(circle.rx, (circle.radius+settings.style.outlineWidth/2)/width), (width-circle.radius-settings.style.outlineWidth/2)/width);
	circle.ry = Math.min(Math.max(circle.ry, (circle.radius+settings.style.outlineWidth/2)/height), (height-circle.radius-settings.style.outlineWidth/2)/height);
};

// < Animation >
function animate() {
	requestAnimationFrame(animate);
	C.clearRect(0, 0, width, height);

	// Variables
	// / Finds the angle going from one circle to another
	// / angles[ab]: The angle from circle "a" to circle "b"
	const angles = {
		'01': findAngle(0, 1),
		'02': findAngle(0, 2),
		'12': findAngle(1, 2)
	};

	// / Finds the tangent points of two circles
	// / tangent[ab]: The tangent points of circle "a" in respect to circle "b"
	const tangent = {};

	// / Finds the contact points of two circles
	// / contact[ab]: Where both pair of lines from tangent[ab] and tangent[ba] intersects
	const contact = {};

	// / Calculates each tangent and contact values
	for (const pair in angles) {
		const riap = pair.split('').reverse().join('');
		const coordinates = findContact(pair[0], pair[1], angles[pair]);
		tangent[pair] = findTangent(pair[0], angles[pair]);
		tangent[riap] = findTangent(riap[0], angles[pair]);
		contact[pair] = {
			x: circles[pair[0]].x-coordinates.x,
			y: circles[pair[0]].y-coordinates.y
		};
	}

	// Draws each tangent line
	for (const pair in angles) {
		// From the first tangent point to the contact point
		// / Outline
		C.lineWidth = settings.style.outlineWidth;
		C.strokeStyle = 'black';
		C.beginPath();
		C.moveTo(tangent[pair][0].x, tangent[pair][0].y);
		C.lineTo(contact[pair].x, contact[pair].y);
		C.stroke();

		// / Line
		C.lineWidth = settings.style.lineWidth;
		C.strokeStyle = settings.style.tangentLineColor;
		C.stroke();

		// From the contact point to the second tangent point
		// / Outline
		C.lineWidth = settings.style.outlineWidth;
		C.strokeStyle = 'black';
		C.beginPath();
		C.moveTo(contact[pair].x, contact[pair].y);
		C.lineTo(tangent[pair][1].x, tangent[pair][1].y);
		C.stroke();

		// Line
		C.lineWidth = settings.style.lineWidth;
		C.strokeStyle = settings.style.tangentLineColor;
		C.stroke();
	}

	// Draws each circles
	for (let i = 0; i < circles.length; i++) {
		// Outline
		C.lineWidth = settings.style.outlineWidth;
		C.strokeStyle = 'black';
		C.beginPath();
		C.arc(circles[i].x, circles[i].y, circles[i].radius, 0, Math.PI*2);
		C.stroke();

		// Circle
		C.lineWidth = settings.style.lineWidth;
		C.strokeStyle = settings.style.circleColors[i];
		C.stroke();
	}

	// Draws the straight line using all of the three contact points
	// / Outline
	C.lineWidth = settings.style.outlineWidth;
	C.strokeStyle = 'black';
	C.beginPath();
	C.moveTo(contact['01'].x, contact['01'].y);
	C.lineTo(contact['02'].x, contact['02'].y);
	C.lineTo(contact['12'].x, contact['12'].y);
	C.stroke();

	// / Line
	C.lineWidth = settings.style.lineWidth;
	C.strokeStyle = settings.style.contactLineColor;
	C.stroke();

	// Saves the smooth mouse coordinates
	mouse.previous.x = mouse.smooth.x;
	mouse.previous.y = mouse.smooth.y;

	// Updates the smooth mouse coordinates to be closer to the real one
	mouse.smooth.x += (mouse.real.x-mouse.smooth.x)/5;
	mouse.smooth.y += (mouse.real.y-mouse.smooth.y)/5;

	// Updates the velocity of the mouse
	mouse.velocity.x = mouse.smooth.x-mouse.previous.x;
	mouse.velocity.y = mouse.smooth.y-mouse.previous.y;

	// Updates the coordinates of the selected circle
	if (mouse.selected) {
		const { circle, displace } = mouse.selected;

		// Updates the selected circle's coordinates
		circle.rx = (mouse.smooth.x+displace.x)/width;
		circle.ry = (mouse.smooth.y+displace.y)/height;

		// Limit the circle's coordinate so the mouse can't drag it out of the screen
		limit(circle);
	}
}

// < Events >
onmousemove = E => {
	[mouse.real.x, mouse.real.y] = [E.x, E.y];
};

onmousedown = () => {
	// Checks if the mouse has clicked inside a circle
	for (const circle of circles) {
		if (Math.hypot(mouse.smooth.x-circle.x, mouse.smooth.y-circle.y) <= circle.radius) {
			// Saves the selected circle and stops the loop
			mouse.selected = {
				circle,
				displace: {
					x: circle.x-mouse.smooth.x,
					y: circle.y-mouse.smooth.y
				}
			};

			break;
		}
	}
};

onmouseup = () => {
	// Remove the selected circle
	mouse.selected = null;
};

onresize = function() {
	width = canvas.width = innerWidth;
	height = canvas.height = innerHeight;

	C.lineWidth = settings.style.lineWidth;
	C.lineCap = 'round';

	// This prevents the circles from clipping out of the screen
	for (const circle of circles) {
		limit(circle);
	}
};

onload = () => {
	console.log(`
"In geometry, Monge's theorem, named after Gaspard Monge, states that for any three circles in a plane, none of which is completely inside one of the others, the intersection points of each of the three pairs of external tangent lines are collinear. For any two circles in a plane, an external tangent is a line that is tangent to both circles but does not pass between them. There are two such external tangent lines for any two circles. Each such pair has a unique intersection point in the extended Euclidean plane. Monge's theorem states that the three such points given by each circle are always in a straight line."
(https://en.wikipedia.org/wiki/Monge's_theorem)


Each three circles' pairs of tangent lines will intersect each other. This results in three points in total, all of which make a perfect straight line.

- Press and hold the mouse on a circle to move it.
`);

	document.title = 'Monge\'s Theorem';
	onresize();
	animate();
};
