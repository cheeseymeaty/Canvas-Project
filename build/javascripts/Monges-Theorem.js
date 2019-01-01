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
	},

	mouseEase: 5,
	circleEase: 5
};

const mouse = {
	real: { x: null, y: null },
	smooth: { x: null, y: null },
	velocity: { x: 0, y: 0 },

	// The mouse's selected circle
	selected: null
};

const circles = [{ radius: 100 }, { radius: 50 }, { radius: 25 }];

// Makes all of the circles have an x and y coordinates
for (const circle of circles) {
	circle.real = { x: null, y: null };
	circle.smooth = { x: null, y: null };
}

// Finds the angle going from circle "a" to circle "b"
const findAngle = (a, b) => Math.atan((circles[a].smooth.x-circles[b].smooth.x)/(circles[a].smooth.y-circles[b].smooth.y));

// Calculates the contact point of the given angle and a circle's index
const findTangent = (index, angle) => {
	const x = Math.cos(angle)*circles[index].radius;
	const y = Math.sin(angle)*circles[index].radius;

	return [
		{ x: circles[index].smooth.x-x, y: circles[index].smooth.y+y },
		{ x: circles[index].smooth.x+x, y: circles[index].smooth.y-y }
	];
};

// Calculates the contact point using two circle's indexes and their angle
const findContact = (a, b, angle) => {
	a = circles[a];
	b = circles[b];
	const hypot = a.radius*Math.hypot(a.smooth.x-b.smooth.x, a.smooth.y-b.smooth.y)/(a.radius-b.radius)*(a.smooth.y < b.smooth.y ? -1 : 1);

	return {
		x: Math.sin(angle)*hypot,
		y: Math.cos(angle)*hypot
	};
};

// Prevents a circle's coordinate from going off screen
const limit = circle => {
	circle.real.x = Math.min(Math.max(circle.real.x, circle.radius+settings.style.outlineWidth/2), width-circle.radius-settings.style.outlineWidth/2);
	circle.real.y = Math.min(Math.max(circle.real.y, circle.radius+settings.style.outlineWidth/2), height-circle.radius-settings.style.outlineWidth/2);
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
			x: circles[pair[0]].smooth.x-coordinates.x,
			y: circles[pair[0]].smooth.y-coordinates.y
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
		C.arc(circles[i].smooth.x, circles[i].smooth.y, circles[i].radius, 0, Math.PI*2);
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

	// Updates the mouse's smooth coordinates and velocity
	mouse.smooth.x += mouse.velocity.x = (mouse.real.x-mouse.smooth.x)/settings.mouseEase;
	mouse.smooth.y += mouse.velocity.y = (mouse.real.y-mouse.smooth.y)/settings.mouseEase;

	// Updates all circles' coordinates
	for (const circle of circles) {
		circle.smooth.x += (circle.real.x-circle.smooth.x)/settings.circleEase;
		circle.smooth.y += (circle.real.y-circle.smooth.y)/settings.circleEase;
	}

	// Updates the coordinates of the selected circle to the mouse's coordinates
	if (mouse.selected) {
		const { circle, displace } = mouse.selected;

		// Make the circle's real coordinates be the same as the mouse's with the displacement
		circle.real.x = mouse.real.x+displace.x;
		circle.real.y = mouse.real.y+displace.y;
	} else {
		// Make all circles go back inside the canvas when it's out of bounds
		for (const circle of circles) {
			limit(circle);
		}
	}
}

// < Events >
onmousemove = E => {
	[mouse.real.x, mouse.real.y] = [E.x, E.y];
};

onmousedown = () => {
	// Checks if the mouse has clicked inside a circle
	for (const circle of circles) {
		if (Math.hypot(mouse.smooth.x-circle.smooth.x, mouse.smooth.y-circle.smooth.y) <= circle.radius) {
			// Saves the selected circle and stops the loop
			mouse.selected = {
				circle,
				displace: {
					x: circle.real.x-mouse.real.x,
					y: circle.real.y-mouse.real.y
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

	onmouseup();
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

	// Put the circles somewhere in the canvas
	for (const circle of circles) {
		circle.real.x = circle.smooth.x = Math.floor(Math.random()*(width-circle.radius*2))+circle.radius;
		circle.real.y = circle.smooth.y = Math.floor(Math.random()*(height-circle.radius*2))+circle.radius;
	}

	animate();
};
