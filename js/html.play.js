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
var textureLoader = new THREE.TextureLoader();
var earthTexture = textureLoader.load("textures/earth.jpg");
var fireballTexture = textureLoader.load("textures/fireball.jpg");
var earthCloudTexture = textureLoader.load("textures/earthcloud.jpg");

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

var score = 0;
var play = true;
document.getElementById('labelScore').innerHTML = score + " POINTS";

var earthGeom = new THREE.SphereGeometry(1.5, 32, 32);
var earthMaterial = new THREE.MeshBasicMaterial({
	color: 0xffffff,
	metalness: 0,
	map: earthTexture
});
var earth = new THREE.Mesh(earthGeom, earthMaterial);
var earthCloudGeom = new THREE.SphereGeometry(1.51, 32, 32);
var earthCloudMaterial = new THREE.MeshBasicMaterial({
	color: 0xffffff,
	metalness: 0,
	alphaMap: earthCloudTexture,
	transparent: true
});
var earthCloud = new THREE.Mesh(earthCloudGeom, earthCloudMaterial);

var earthGroup = new THREE.Group();
earthGroup.add(earth);
earthGroup.add(earthCloud);
scene.add(earthGroup);

var fireballGroup = new THREE.Group();

earthGroup.add(fireballGroup);

camera.position.z = 10;
var vitesse = 5;
var start = [];

var curve = []

flashText()

var raycaster = new THREE.Raycaster(),
	mouse = new THREE.Vector2(),
	intersects;
renderer.domElement.addEventListener('click', searchTarget, false);

function getDistance(mesh1, mesh2) {
	var dx = mesh1.position.x - mesh2.position.x;
	var dy = mesh1.position.y - mesh2.position.y;
	var dz = mesh1.position.z - mesh2.position.z;
	return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function searchTarget(event) {
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

	raycaster.setFromCamera(mouse, camera);
	intersects = raycaster.intersectObjects(fireballGroup.children);
	if (intersects.length > 0) {
		score += 10
		document.getElementById('labelScore').innerHTML = score + " POINTS";
		let indexToDelete = fireballGroup.children.indexOf(intersects[0].object)
		start.splice(indexToDelete, 1)
		curve.splice(indexToDelete, 1)
		fireballGroup.remove(intersects[0].object);
	}
}

var time = 1000;

function flashText() {
	if (fireballGroup.children.length < 20 && play) {
		setTimeout(() => {

			let newFireball = new THREE.Mesh(new THREE.SphereGeometry(0.35, 32, 32), new THREE.MeshBasicMaterial({
				color: 0xffffff,
				metalness: 0,
				map: fireballTexture
			}));

			let coefY = (Math.random() * (200 - 0) + 0) / 100
			let coefZ = (Math.random() * (200 - 0) + 0) / 100

			newFireball.rotateY(coefY * Math.PI);
			newFireball.rotateZ(coefZ * Math.PI);
			newFireball.translateX(8);

			curve.push(randomCurve(newFireball.position.x, newFireball.position.y, newFireball.position.z))
			fireballGroup.add(newFireball)
			time *= 0.99
			flashText()
		}, time)
	}
}

var gameOverHtml = document.createElement('h1');
gameOverHtml.id = "gameOver";
gameOverHtml.innerHTML = 'GAME OVER<br/><a style="color: white; text-decoration: none;" href=\"play.html\">START AGAIN</a><br/><a style="color: white; text-decoration: none;" href=\"index.html\">MAIN MENU</a>';

var animate = function (t) {
	if (play) {
		earth.rotateY(0.0008);
		earthCloud.rotateY(0.0014);

		if (fireballGroup.children.length > start.length) {
			start.push(t)
		}

		curve.map((c, index) => {
			if (c != null && fireballGroup.children[index] != undefined) {

				let delai = t - start[index];

				c.getPoint((delai * vitesse * .00001) % 1, fireballGroup.children[index].position);
			}
		})

	}

	requestAnimationFrame(animate);
	renderer.render(scene, camera);

	if (play) {
		if (vitesse < 100) {
			vitesse = vitesse * 1.00015;
		}

		fireballGroup.children.map((f, index) => {
			if (getDistance(f, earth) < 1.86) {

				earthGroup.remove(fireballGroup)
				scene.remove(earthGroup)
				play = false;
				document.body.appendChild(gameOverHtml);
			}
		})
	}
};

requestAnimationFrame(animate);

function randomCurve(x, y, z) {
	return new THREE.CubicBezierCurve3(
		new THREE.Vector3(x, y, z),
		new THREE.Vector3(1.5, 1.5, 1.5)
	);
}