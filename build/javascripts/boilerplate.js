// < Declarations >
const canvas = document.querySelector('canvas');
const C = canvas.getContext('2d');

let { width, height } = canvas;

const settings = {
	style: {

	},

	mouseEase: 5
};

const keyboard = {};

const mouse = {
	real: { x: null, y: null },
	smooth: { x: null, y: null },
	velocity: { x: null, y: null }
};

// < Animation >
function animate() {
	requestAnimationFrame(animate);
	C.clearRect(0, 0, width, height);

	C.fillText('boilerplate.js', 15, 15);
	C.beginPath();
	C.arc(mouse.smooth.x, mouse.smooth.y, 5, 0, Math.PI*2);
	C.fill();

	// Updates the mouse's smooth coordinates and velocity
	mouse.smooth.x += mouse.velocity.x = (mouse.real.x-mouse.smooth.x)/settings.mouseEase;
	mouse.smooth.y += mouse.velocity.y = (mouse.real.y-mouse.smooth.y)/settings.mouseEase;
	console.log(mouse.smooth.x, mouse.smooth.y);
}

// < Events >
onmousemove = E => {
	[mouse.real.x, mouse.real.y] = [E.x, E.y];
};

onkeydown = E => {
	// Switch case for key presses
	switch (E.code) {

	}
};

onkeyup = E => {
	// Switch case for key releases
	switch (E.code) {

	}
};

onresize = function() {
	width = canvas.width = innerWidth;
	height = canvas.height = innerHeight;
};

onload = () => {
	console.log(`
Quote
(Reference)


Description

- Keys and controls
`);

	document.title = 'boilerplate';
	onresize();
	animate();
};
