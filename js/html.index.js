function resize() {
	renderer.setSize(window.innerWidth, window.innerHeight);
}
window.onresize = resize;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer({
	antialias: true
});

var controls = new THREE.OrbitControls(camera, renderer.domElement);

var path = "textures/";
var name = 'cosmos.png';
var urls = [
	path + name,
	path + name,
	path + name,
	path + name,
	path + name,
	path + name
];

var reflectionCube = THREE.ImageUtils.loadTextureCube(urls);
reflectionCube.format = THREE.RGBFormat;

var reflectionCubeShader = THREE.ShaderLib["cube"];
reflectionCubeShader.uniforms["tCube"].value = reflectionCube;

var reflectionCubeMaterial = new THREE.ShaderMaterial({
	fragmentShader: reflectionCubeShader.fragmentShader,
	vertexShader: reflectionCubeShader.vertexShader,
	uniforms: reflectionCubeShader.uniforms,
	depthWrite: false,
	side: THREE.BackSide
});

reflectionCubeMesh = new THREE.Mesh(new THREE.BoxGeometry(150, 150, 150), reflectionCubeMaterial);
scene.add(reflectionCubeMesh);

scene.background = new THREE.Color(0, 0, 0);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var gameOverHtml = document.createElement('h1');
gameOverHtml.id = "gameOver";
gameOverHtml.innerHTML = 'FIREBALL<br/><a style="color: white; text-decoration: none;" href=\"play.html\">START</a><br/><a style="color: white; text-decoration: none;" href=\"..\">QUIT</a>';
document.body.appendChild(gameOverHtml);