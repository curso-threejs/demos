import * as THREE from "three";
import { OrbitControls } from "OrbitControls";

const htmlContainer = document.getElementById("container3D");
const renderer = new THREE.WebGLRenderer();
let scene, camera, controls;
let cube;
let t = 0;


function onResize() {
	const width = htmlContainer.offsetWidth;
	const height = htmlContainer.offsetHeight;
	const aspect = width / height;
	
	camera.aspect = aspect;
	camera.updateProjectionMatrix();  

	renderer.setSize(htmlContainer.offsetWidth, htmlContainer.offsetHeight);
}

function createScene() {
	
	const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
	scene.add(light);

	const gridHelper = new THREE.GridHelper(8, 8);
	scene.add(gridHelper);

	const axesHelper = new THREE.AxesHelper();
	scene.add(axesHelper);

}

function createGeometry(){
	var geometry = new THREE.BufferGeometry();
	// create a simple square shape. We duplicate the top left and bottom right
	// vertices because each vertex needs to appear once per triangle.
	var vertices = new Float32Array( [
			-10.0, 0.0, -10.0,  
			10.0, 0.0, 10.0, 
			 10.0, 0.0,-10.0, 
			 

			 10.0, 0.0, 10.0, 
			 -10.0, 0.0, -10.0,
			-10.0, 0.0, 10.0, 
			
	] );

	var normals = new Float32Array( [
			 0.0,  1.0,  0.0,
			 0.0,  1.0,  0.0,
			 0.0,  1.0,  0.0,

			 0.0,  1.0,  0.0,
			 0.0,  1.0,  0.0,
			 0.0,  1.0,  0.0
	] );

	// itemSize = 3 because there are 3 values (components) per vertex
	geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
	geometry.setAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );

	var material = new THREE.MeshPhongMaterial( {color: 0x994400,shininess:16,specular:0x888888} );            
	
	var mesh = new THREE.Mesh( geometry, material );            
	scene.add(mesh);

}

function setup() {
	// Add the THREE.js canvas to the HTML
	htmlContainer.appendChild(renderer.domElement);

	// Setup scene & camera
	scene = new THREE.Scene();

	const width = htmlContainer.offsetWidth;
	const height = htmlContainer.offsetHeight;
	const aspect = width / height;
	camera = new THREE.PerspectiveCamera(
		/* defaulted fov */ undefined,
		aspect,
		0.01,
		100
	);

	camera.position.set(7, 7, 7);
	camera.lookAt(0, 0, 0);

	// Setup the control to manipulate the camera with the mouse
	controls = new OrbitControls(camera, renderer.domElement);

	// Setup resize listener
	window.addEventListener("resize", onResize, false);
	onResize();

	createScene();
}

/** Loop-function que se llama en cada frame
 */
function animate() {
	// En cada frame vamos a incrementar la variable "t" que representa el tiempo
	t += 0.006;

	requestAnimationFrame(animate);
	controls.update();
	renderer.render(scene, camera);
}

setup();
animate();
