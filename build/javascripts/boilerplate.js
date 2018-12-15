// < Declarations >
const canvas = document.querySelector('canvas');
const C = canvas.getContext('2d');

let { width, height } = canvas;

const settings = {};

const keyboard = {};

// < Animation >
function animate() {
	requestAnimationFrame(animate);
	C.clearRect(0, 0, width, height);
	C.fillText('boilerplate.js', 15, 15);
}

// < Events >
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
