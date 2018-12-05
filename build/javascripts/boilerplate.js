// Declarations
const canvas = document.querySelector('canvas');
const C = canvas.getContext('2d');

let { width, height } = canvas;

// Animation
function animate() {
	requestAnimationFrame(animate);
	C.clearRect(0, 0, width, height);
	C.fillText('boilerplate.js', 15, 15);
}

// Events
onresize = () => {
	width = canvas.width = innerWidth;
	height = canvas.height = innerHeight;
};

onload = () => {
	document.title = 'boilerplate'
	onresize();
	animate();
};
