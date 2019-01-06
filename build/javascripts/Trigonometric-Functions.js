// < Declarations >
const canvas = document.querySelector('canvas');
const C = canvas.getContext('2d');

let { width, height } = canvas;

const settings = {
	style: {
		lineWidth: 3,

		text: {
			outline: 3,
			font: '17.5px "Roboto Mono"'
		},

		colors: {
			sine: 'rgb(255, 0, 0)',
			cosine: 'rgb(0, 0, 255)',
			tangent: 'rgb(128, 0, 255)',
			cotangent: 'rgb(255, 0, 255)',
			secant: 'rgb(255, 128, 0)',
			cosecant: 'rgb(0, 200, 0)'
		},
		space: {
			sine: 15,
			cosine: 10,
			tangent: 1.15,
			angle: 45
		}
	},

	mouseEase: 5,
	angleEase: 10,
	orbitSpeed: 0.01,
	orbit: 0
};

const mouse = {
	real: { x: null, y: null },
	smooth: { x: null, y: null },
	velocity: { x: null, y: null },
	inner: {
		real: { x: null, y: null },
		smooth: { x: null, y: null }
	}
};

const circle = {
	radius: 250,
	inCircle: false,
	angle: 0,

	point: { x: null, y: null },
	value: {
		sine: 0,
		cosine: 0,
		tangent: 0,
		cotangent: 0,
		secant: 0,
		cosecant: 0
	},

	get x() {
		return width/2;
	},

	get y() {
		return height/2;
	}
};

const write = (string, x, y) => {
	C.beginPath();
	C.strokeText(string, x, y);
	C.fillText(string, x, y);
};

// < Animation >
function animate() {
	requestAnimationFrame(animate);
	C.clearRect(0, 0, width, height);

	// Draws the circle
	C.lineWidth = settings.style.lineWidth;
	C.strokeStyle = 'black';
	C.beginPath();
	C.arc(circle.x, circle.y, circle.radius, 0, Math.PI*2);
	C.stroke();

	// Draws a line going from the circle's center to the direction of the mouse
	C.beginPath();
	C.moveTo(circle.x, circle.y);
	C.lineTo(circle.point.x, circle.point.y);
	C.stroke();

	// Draws a circle representing the angle
	C.beginPath();
	C.arc(circle.x, circle.y, 25, 0, circle.angle, true);
	C.stroke();

	// Draws lines from the ends of the sine and cosine lines to the point
	// / Cosine
	C.beginPath();
	C.moveTo(circle.point.x, circle.y);
	C.lineTo(circle.point.x, circle.point.y);
	C.stroke();

	// / Sine
	C.beginPath();
	C.moveTo(circle.x, circle.point.y);
	C.lineTo(circle.point.x, circle.point.y);
	C.stroke();

	// Draws the lines each of the trigonometric functions
	// / Secant
	C.strokeStyle = settings.style.colors.secant;
	C.beginPath();
	C.moveTo(circle.x, circle.y);
	C.lineTo(circle.x+circle.value.secant, circle.y);
	C.stroke();

	// / Cosecant
	C.strokeStyle = settings.style.colors.cosecant;
	C.beginPath();
	C.moveTo(circle.x, circle.y);
	C.lineTo(circle.x, circle.y+circle.value.cosecant);
	C.stroke();

	// / Cosine
	C.strokeStyle = settings.style.colors.cosine;
	C.beginPath();
	C.moveTo(circle.x, circle.y);
	C.lineTo(circle.point.x, circle.y);
	C.stroke();

	// / Sine
	C.strokeStyle = settings.style.colors.sine;
	C.beginPath();
	C.moveTo(circle.x, circle.y);
	C.lineTo(circle.x, circle.point.y);
	C.stroke();

	// / Tangent
	C.strokeStyle = settings.style.colors.tangent;
	C.beginPath();
	C.moveTo(circle.point.x, circle.point.y);
	C.lineTo(circle.x+circle.value.secant, circle.y);
	C.stroke();

	// / Cotangent
	C.strokeStyle = settings.style.colors.cotangent;
	C.beginPath();
	C.moveTo(circle.point.x, circle.point.y);
	C.lineTo(circle.x, circle.y+circle.value.cosecant);
	C.stroke();

	// Draws a dot at the point
	C.fillStyle = 'black';
	C.beginPath();
	C.arc(circle.point.x, circle.point.y, 2.5, 0, Math.PI*2);
	C.fill();

	// Writes the angle
	// / Saves the properties of each text
	const angle = circle.angle < 0 ? Math.abs(circle.angle) : Math.PI*2-circle.angle;
	C.lineWidth = settings.style.text.outline;
	C.textAlign = 'center';
	C.strokeStyle = 'white';
	C.fillStyle = 'black';
	write(
		Math.round(angle*(180/Math.PI)) + '°',
		circle.x-Math.sin((angle-Math.PI)/2)*settings.style.space.angle,
		circle.y-Math.cos((angle-Math.PI)/2)*settings.style.space.angle
	);

	// Writes the value of each trigonometric functions
	// / Secant
	C.textAlign = 'center';
	C.fillStyle = settings.style.colors.secant;
	write(
		(circle.value.secant/circle.radius).toFixed(3),
		circle.x+circle.value.secant/2,
		circle.y-settings.style.space.sine
	);

	// / Cosecant
	C.textAlign = 'left';
	C.fillStyle = settings.style.colors.cosecant;
	write(
		(-circle.value.cosecant/circle.radius).toFixed(3),
		circle.x+settings.style.space.cosine,
		circle.y+circle.value.cosecant/2
	);

	// / Cosine
	C.textAlign = 'center';
	C.fillStyle = settings.style.colors.cosine;
	write(
		circle.value.cosine.toFixed(3),
		(circle.x+circle.point.x)/2,
		circle.y+settings.style.space.sine
	);

	// / Sine
	C.textAlign = 'right';
	C.fillStyle = settings.style.colors.sine;
	write(
		(-circle.value.sine).toFixed(3),
		circle.x-settings.style.space.cosine,
		(circle.y+circle.point.y)/2
	);

	// / Tangent
	C.textAlign = 'center';
	C.fillStyle = settings.style.colors.tangent;
	write(
		circle.value.tangent.toFixed(3),
		circle.x+(circle.point.x-circle.x+circle.value.secant)/2*settings.style.space.tangent,
		circle.y+(circle.point.y-circle.y)/2*settings.style.space.tangent
	);

	// / Cotangent
	C.textAlign = 'center';
	C.fillStyle = settings.style.colors.cotangent;
	write(
		(circle.value.cotangent/circle.radius).toFixed(3),
		circle.x+(circle.point.x-circle.x)/2*1.1,
		circle.y+(circle.point.y-circle.y+circle.value.cosecant)/2*settings.style.space.tangent
	);

	// Updates the mouse's smooth coordinates and velocity
	mouse.smooth.x += mouse.velocity.x = (mouse.real.x-mouse.smooth.x)/settings.mouseEase;
	mouse.smooth.y += mouse.velocity.y = (mouse.real.y-mouse.smooth.y)/settings.mouseEase;

	// Updates the mouse inner coordinates that's inside the circle
	if (mouse.inCircle) {
		mouse.inner.real.x = mouse.smooth.x;
		mouse.inner.real.y = mouse.smooth.y;
		settings.orbit = circle.angle;
	} else {
		mouse.inner.real.x = circle.x+Math.cos(settings.orbit)*circle.radius;
		mouse.inner.real.y = circle.y+Math.sin(settings.orbit)*circle.radius;
		settings.orbit += settings.orbitSpeed;
	}

	// Updates the mouse's smooth inner coordinates
	mouse.inner.smooth.y += (mouse.inner.real.y-mouse.inner.smooth.y)/settings.angleEase;
	mouse.inner.smooth.x += (mouse.inner.real.x-mouse.inner.smooth.x)/settings.angleEase;

	// Updates the angle
	circle.angle = Math.atan2(mouse.inner.smooth.y-circle.y, mouse.inner.smooth.x-circle.x);

	// Updates the values to the trigonometric functions' output
	circle.value.cosine = Math.cos(circle.angle);
	circle.value.sine = Math.sin(circle.angle);
	circle.value.tangent = Math.tan(circle.angle);
	circle.value.cotangent = circle.radius/circle.value.tangent;
	circle.value.secant = circle.radius/circle.value.cosine;
	circle.value.cosecant = circle.radius/circle.value.sine;

	// Updates the point's coordinates
	circle.point.x = circle.x+circle.value.cosine*circle.radius;
	circle.point.y = circle.y+circle.value.sine*circle.radius;
}

// < Events >
onmousemove = E => {
	[mouse.real.x, mouse.real.y] = [E.x, E.y];
	mouse.inCircle = Math.hypot(circle.x-mouse.real.x, circle.y-mouse.real.y) <= circle.radius;
};

onresize = function() {
	width = canvas.width = innerWidth;
	height = canvas.height = innerHeight;

	C.font = settings.style.text.font;
	C.lineCap = 'round';
	C.textBaseline = 'middle';
};

onload = () => {
	console.log(`
"Trigonometry is most simply associated with planar right-angle triangles (each of which is a two-dimensional triangle with one angle equal to 90 degrees). The applicability to non-right-angle triangles exists, but, since any non-right-angle triangle (on a flat plane) can be bisected to create two right-angle triangles, most problems can be reduced to calculations on right-angle triangles. Thus the majority of applications relate to right-angle triangles."
(https://en.wikipedia.org/wiki/Trigonometry)


This is a visual and interactive demostration of the trigonometric functions. The key of each functions is provided here:
> Red:    Cosine
> Blue:   Sine
> Purple: Tangent
> Pink:   Cotangent
> Orange: Secant    (Not to be confused with Exsecant)
> Green:  Coscant   (Not to be confused with Versine)

- Move the mouse in the circle to change the angle.
- Move the mouse outside the circle to make the angle decrease over time.
`);

	document.title = 'Trigonometric Functions';
	onresize();

	// Make the mouse coordinates in the circle's center
	mouse.inner.real.x = mouse.inner.smooth.x = width/2;
	mouse.inner.real.y = mouse.inner.smooth.y = height/2;

	animate();
};
