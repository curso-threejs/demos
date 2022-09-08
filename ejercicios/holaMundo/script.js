import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const htmlContainer = document.getElementById("container3D");
const renderer = new THREE.WebGLRenderer();
let scene, camera, controls;
let cube;

/** Este callback se llama siempre que el browser cambia de tamaño
 */
function onResize() {
  const width = htmlContainer.offsetWidth;
  const height = htmlContainer.offsetHeight;
  const aspect = width / height;

  // Actualizo las propiedades de la camara
  camera.aspect = aspect;
  camera.updateProjectionMatrix();

  // Y actualizamos las propiedades del renderer (que a su vez actualiza el DOM canvas del HTML)
  renderer.setSize(htmlContainer.offsetWidth, htmlContainer.offsetHeight);
}

function createScene() {
  // Add hemisphere light
  const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
  scene.add(light);

  // Add a grid
  const gridHelper = new THREE.GridHelper(8, 8);
  scene.add(gridHelper);

  // Add axes helper
  const axesHelper = new THREE.AxesHelper();
  scene.add(axesHelper);

  // Add a cube
  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
  const cubeMaterial = new THREE.MeshPhongMaterial({ color: 0xff00ff });
  cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  scene.add(cube);
}

/** Función que se llama sólo una vez para crear y configurar la escena
 */
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
  cube.position.set(0, 0, 0);
  cube.rotateY(0);
  cube.material.color.setRGB(1, 0, 1);

  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

setup();
animate();
