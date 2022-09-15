import * as THREE from "three";
import { OrbitControls } from "OrbitControls";
import { GLTFLoader } from "GLTFLoader";

const htmlContainer = document.getElementById("container3D");
const renderer = new THREE.WebGLRenderer();

let scene, camera, controls;
let t = 0;

let sun;
let earth;
let moon;
let iss;
let apollo;
let earthMoonGroup;
let moonGroup;
let clock;
let activeCamera = 0;
let trailEarth;
let trailMoon;
let trailIss;


const EARTH_ROTATION_SPEED = 0.025;
const EARTH_SUN_DISTANCE = 60;
const MOON_EARTH_DISTANCE = 20;
const ISS_EARTH_DISTANCE = 10;
const APOLLO_MOON_DISTANCE = 3;

let cameras = [];

function onResize() {
	const width = htmlContainer.offsetWidth;
	const height = htmlContainer.offsetHeight;
	const aspect = width / height;

	// Actualizo las propiedades de la camara
	cameras.forEach((cam, i) => {
		cam.aspect = aspect;
		cam.updateProjectionMatrix();
	})

	// Y actualizamos las propiedades del renderer (que a su vez actualiza el DOM canvas del HTML)
	renderer.setSize(htmlContainer.offsetWidth, htmlContainer.offsetHeight);
}

function createScene() {
	// Add hemisphere light
	const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
	scene.add(light);


	const sunLight = new THREE.PointLight(0xff9933, 1);
	scene.add(sunLight);

	// Add a grid
	const gridHelper = new THREE.GridHelper(200, 20, new THREE.Color(0.4, 0.4, 0.4), new THREE.Color(0.2, 0.2, 0.2));
	scene.add(gridHelper);

	// Add axes helper
	const axesHelper = new THREE.AxesHelper();
	scene.add(axesHelper);

	loadModels();

}

function loadModels() {

	let loader = new GLTFLoader();
	loader.load('models/sistemaSolar.glb', function (gltf) {

		sun = gltf.scene.getObjectByName("sol");
		apollo = gltf.scene.getObjectByName("apollo");
		iss = gltf.scene.getObjectByName("iss");
		earth = gltf.scene.getObjectByName("tierra");
		moon = gltf.scene.getObjectByName("luna");

		createSolarSystem();
	});

}

function Trail(maxPoints, initialPos, tone) {

	let points = [];
	let frame = 0;

	let segments = maxPoints;

	let trailsGeo = new THREE.BufferGeometry();
	let trailsMat = new THREE.LineBasicMaterial({ vertexColors: THREE.VertexColors });

	let positions = new Float32Array(segments * 3);
	let colors = new Float32Array(segments * 3);

	for (let i = 0; i < segments; i++) {

		// positions
		positions[i * 3] = initialPos.x;
		positions[i * 3 + 1] = initialPos.y;
		positions[i * 3 + 2] = initialPos.z;

		let col = new THREE.Color();
		let sat = 0.5 * i / segments + 0.5;
		col.setHSL(tone, 1, sat);

		colors[i * 3] = col.r;
		colors[i * 3 + 1] = col.g;
		colors[i * 3 + 2] = col.b;
	}


	trailsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
	trailsGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
	trailsGeo.computeBoundingSphere();


	let trailsMesh = new THREE.Line(trailsGeo, trailsMat);
	trailsMesh.frustumCulled = false;
	scene.add(trailsMesh);

	this.reset = function () {
		points = [];
	}

	this.pushPosition = function (pos) {


		points.push(pos);
		if (points.length > maxPoints) points.shift();
		if (frame < 1) points.shift();

		let j;
		if (trailsGeo && points.length > 10) {
			let att = trailsGeo.getAttribute("position");
			let att2 = trailsGeo.getAttribute("color");

			for (let i = 0; i < maxPoints; i++) {

				if (i < points.length) j = i;
				else j = points.length - 1;

				let col = new THREE.Color();
				let sat = 0.5 * j / points.length + 0.1;
				col.setHSL(tone, 1, sat);


				att.setXYZ(i, points[j].x, points[j].y, points[j].z);
				att2.setXYZ(i, col.r, col.g, col.b);
			}

			att.needsUpdate = true;
			att2.needsUpdate = true;

		}//if
		frame++;
	}


}

function setup() {

	htmlContainer.appendChild(renderer.domElement);
	
	scene = new THREE.Scene();

	const width = htmlContainer.offsetWidth;
	const height = htmlContainer.offsetHeight;
	const aspect = width / height;

	// global cam
	camera = new THREE.PerspectiveCamera(50, 1, 0.01, 10000);
	camera.lookAt(0, 0, 0);
	camera.position.set(100, 100, 100)
	cameras.push(camera);
	
	controls = new OrbitControls(camera, renderer.domElement);

	window.addEventListener("resize", onResize, false);
	

	clock = new THREE.Clock();

	createScene();

	window.addEventListener("keydown", (e) => {
		if (e.key == "c") toggleCam();
	})
}

function toggleCam() {

	activeCamera++;
	if (activeCamera >= cameras.length) activeCamera = 0;

	camera = cameras[activeCamera];
}

function createSolarSystem() {


	earthMoonGroup = new THREE.Group();
	let axesHelper = new THREE.AxesHelper(15);
	earthMoonGroup.add(axesHelper);
	earthMoonGroup.add(iss);
	earthMoonGroup.add(earth);


	moonGroup = new THREE.Group();
	axesHelper = new THREE.AxesHelper(7);
	moonGroup.add(axesHelper);
	moonGroup.add(moon);
	moonGroup.add(apollo);
	

	earthMoonGroup.add(moonGroup);
	sun.add(earthMoonGroup);
	scene.add(sun);


	earth.position.set(0, 0, 0);
	earth.rotation.order = "ZYX";
	earth.rotation.z = 23 * Math.PI / 180;	

	moon.position.set(0, 0, 0);
	apollo.rotation.z = -Math.PI / 2;

	// earth Cam
	camera = new THREE.PerspectiveCamera(50, 1, 0.01, 10000);
	camera.position.set(20, 20, 20);
	camera.lookAt(0, 0, 0)
	earthMoonGroup.add(camera);
	cameras.push(camera);

	// Moon Cam
	camera = new THREE.PerspectiveCamera(50, 1, 0.01, 10000);
	camera.position.set(10, 10, 10);
	camera.lookAt(0, 0, 0)
	moonGroup.add(camera);
	cameras.push(camera);

	// Apollo Cam
	camera = new THREE.PerspectiveCamera(50, 1, 0.01, 10000);
	camera.position.set(0.3, 2, 0.0);
	camera.up.set(-1, 0, 0)
	camera.lookAt(0, 0, 0)
	apollo.add(camera);
	cameras.push(camera);

	// ISS Cam
	camera = new THREE.PerspectiveCamera(50, 1, 0.01, 10000);
	camera.position.set(0, -5, 0);
	camera.up.set(1, 0, 0)
	camera.lookAt(0, 0, 0)
	iss.add(camera);
	cameras.push(camera);

	camera = cameras[activeCamera];

	trailEarth = new Trail(2000, new THREE.Vector3(0, 0, 0), 0.15);
	trailMoon = new Trail(2000, new THREE.Vector3(0, 0, 0), 0.45);
	trailIss = new Trail(2000, new THREE.Vector3(0, 0, 0), 0.75);

	clock.start();
	onResize();
	animate();
}

function animate() {
	t += clock.getDelta();

	let earthAngle = t * 0.1;
	earthMoonGroup.position.set(
		EARTH_SUN_DISTANCE * Math.cos(earthAngle),
		0,
		EARTH_SUN_DISTANCE * Math.sin(earthAngle)
	);

	let moonAngle = t * 0.5;
	moonGroup.position.set(
		MOON_EARTH_DISTANCE * Math.cos(moonAngle),
		0,
		MOON_EARTH_DISTANCE * Math.sin(moonAngle)
	)
	moon.rotation.y = -moonAngle;

	let issAngle = t;
	iss.position.set(
		ISS_EARTH_DISTANCE * Math.cos(issAngle),
		ISS_EARTH_DISTANCE * Math.sin(issAngle),
		0
	);
	iss.rotation.z = issAngle + Math.PI / 2;


	earth.rotation.y += EARTH_ROTATION_SPEED;

	let apolloAngle = -t * 0.2;
	apollo.rotation.y = -apolloAngle
	apollo.position.set(
		APOLLO_MOON_DISTANCE * Math.cos(apolloAngle),
		0,
		APOLLO_MOON_DISTANCE * Math.sin(apolloAngle)
	)


	trailEarth.pushPosition(earth.localToWorld(new THREE.Vector3()));
	trailMoon.pushPosition(moon.localToWorld(new THREE.Vector3()));
	trailIss.pushPosition(iss.localToWorld(new THREE.Vector3()));

	requestAnimationFrame(animate);
	controls.update();
	renderer.render(scene, camera);
}

setup();

