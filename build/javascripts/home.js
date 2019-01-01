const PROJECTS = ['Chaos-Game-Triangle', 'Graphing-Calculator', 'Monges-Theorem', 'Napoleons-Theorem', 'Ptolemys-Theorem', 'Vivianis-Theorem'];

// STOP
import $ from 'jquery';

const paragraph = 'This is the Home Page. Use this to load a canvas project. You can come back here by going to "localhost:8080/build/". Remember to open the console (F12) to read their descriptions!';

$('<h1>Welcome To Canvas Projects!<h1>').appendTo(document.body);
$(`<p>${paragraph}<p>`).appendTo(document.body);
$('<a target="left" href="https://github.com/cheeseymeaty/Canvas-Project">GitHub<a><br><br>').appendTo(document.body);
$('<p>Projects:<p>').appendTo(document.body);

$('<ol id="list"></ol>').appendTo(document.body);

for (const name of PROJECTS) {
	$(`<li><a href="http://localhost:8080/build/?project=${name}">${name.replace(/-/g, ' ')}</a></li>`).appendTo($('#list'));
}
