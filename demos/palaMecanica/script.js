import * as THREE from "three";
import { OrbitControls } from "OrbitControls";
import { loadModels } from "./loader.js";

const modelPaths = [
  "/assets/palaMecanica/antebrazo.dae",
  "/assets/palaMecanica/brazo.dae",
  "/assets/palaMecanica/cabina.dae",
  "/assets/palaMecanica/chasis.dae",
  "/assets/palaMecanica/cubierta.dae",
  "/assets/palaMecanica/eje.dae",
  "/assets/palaMecanica/llanta.dae",
  "/assets/palaMecanica/pala.dae",
  "/assets/palaMecanica/tuerca.dae",
];

const htmlContainer = document.getElementById("container3D");
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  logarithmicDepthBuffer: true, // Prevents z-fighting
});
let scene, camera, controls;

/** This callback is called whenever the browser window is resized
 */
function onResize() {
  const width = htmlContainer.offsetWidth;
  const height = htmlContainer.offsetHeight;
  const aspect = width / height;

  // Update the camera properties
  camera.aspect = aspect;
  camera.updateProjectionMatrix();

  // And update the renderer properties (which will update the canvas DOM element)
  renderer.setSize(htmlContainer.offsetWidth, htmlContainer.offsetHeight);
}

/** Function called only once to create & setup the scene
 */
function createScene() {
  var light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
  scene.add(light);

  // light = new THREE.PointLight(0xffffff, 1);
  // light.position.set(200.0, 1000.0, 0.0);
  // scene.add(light);
  light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(1, 1, 1);
  scene.add(light);

  const gridHelper = new THREE.GridHelper(1000, 10);
  scene.add(gridHelper);

  loadModels(modelPaths, (models) => {
    models.forEach((model, i) => {
      model.add(new THREE.AxesHelper(20)); // Debugging helpers
      // model.rotation.set(0, 0, 0); // Arreglamos la rotación de los modelos
      model.position.setX(i * 100 - (models.length * 100) / 2); // Distribuimos las piezas en el eje X para una linda presentación (?)
      scene.add(model);
    });

    // solve();
  });
}

function solve() {
  const cabina = scene.getObjectByName("cabina");
  const brazo = scene.getObjectByName("brazo");
  const antebrazo = scene.getObjectByName("antebrazo");
  const pala = scene.getObjectByName("pala");
  const chasis = scene.getObjectByName("chasis");
  const eje = scene.getObjectByName("eje");
  const llanta = scene.getObjectByName("llanta");
  const cubierta = scene.getObjectByName("cubierta");
  const tuerca = scene.getObjectByName("tuerca");
  const vehiculo = new THREE.Group();

  // **************************************************************
  // Ejercicio:
  // **************************************************************
  //
  // Desplazamientos relativos entre piezas:
  //
  // chasis       >>      cabina        0,25,0
  // cabina       >>      brazo         20, 20, -10
  // brazo        >>      antebrazo     -102,0,0
  // antebrazo    >>      pala          -60,0,0
  // chasis       >>      eje            20,5,0
  // eje          >>      llanta         0,25,0
  // llanta       >>      cubierta       0,0,0
  // llanta       >>      tuerca         0,3,0
  //
  // ***************************************************************

  chasis.position.set(0, 0, 0);

  chasis.add(cabina);
  cabina.position.set(0, 25, 0);

  cabina.add(brazo);
  brazo.position.set(20, 20, -10);
  brazo.rotation.z = -Math.PI / 4;

  brazo.add(antebrazo);
  antebrazo.position.set(-102, 0, 0);

  antebrazo.add(pala);
  pala.position.set(-60, 0, 0);

  chasis.add(eje);
  eje.position.set(20, 5, 0);
  eje.rotation.x = Math.PI / 2;

  eje.add(llanta);
  llanta.position.set(0, 25, 0);

  llanta.add(cubierta);
  cubierta.position.set(0, 0, 0);

  llanta.add(tuerca);
  tuerca.position.set(0, 3, 0);

  const llanta2 = llanta.clone();
  llanta2.position.y *= -1;
  llanta2.scale.y *= -1;
  eje.add(llanta2);

  const eje2 = eje.clone();
  eje2.position.x *= -1;
  chasis.add(eje2);

  vehiculo.add(cabina);
  vehiculo.add(chasis);
  scene.add(vehiculo);
}

/** Function called only once to setup & configure the basic THREE.js components
 */
function setup() {
  htmlContainer.appendChild(renderer.domElement);
  renderer.setClearColor(0xaaaaaa, 1);
  renderer.toneMapping = THREE.LinearToneMapping;

  // Setup scene & camera
  scene = new THREE.Scene();

  const width = htmlContainer.offsetWidth;
  const height = htmlContainer.offsetHeight;
  const aspect = width / height;
  camera = new THREE.PerspectiveCamera(
    /* defaulted fov */ undefined,
    aspect,
    0.01,
    10000
  );

  camera.position.set(-700, 700, 700);
  camera.lookAt(0, 0, 0);

  // Setup the control to manipulate the camera with the mouse
  controls = new OrbitControls(camera, renderer.domElement);

  // Setup resize listener
  window.addEventListener("resize", onResize, false);
  onResize();

  createScene();

  window.scene = scene;
}

/** Loop function called on every frame
 */
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

setup();
animate();
