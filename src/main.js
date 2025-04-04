import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const canvas = document.querySelector("canvas.webgl");
const scene = new THREE.Scene();

// пол
const geometry = new THREE.PlaneGeometry(20, 20, 100, 100);
const color = new THREE.Color("rgb(45, 44, 44)");
const material = new THREE.MeshBasicMaterial({
  color: color,
  side: THREE.DoubleSide,
  // wireframe: true,
});
const plane = new THREE.Mesh(geometry, material);
plane.rotation.x = -Math.PI * 0.5;
scene.add(plane);

const box = new THREE.BoxGeometry(1, 1, 1);
const boxMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const boxMesh = new THREE.Mesh(box, boxMaterial);
scene.add(boxMesh);

// const light = new THREE.AmbientLight(0x404040); // soft white light
// scene.add(light);

// const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
// scene.add( directionalLight );



const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
// 🧩 Обработка ресайза
window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// // Cвет
// const light = new THREE.AmbientLight(0x404040); // soft white light
// scene.add(light);


// const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
// scene.add( directionalLight );

/**
 * Камера
 */
// базовая камера
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 10;
camera.position.y = 8;
camera.position.z = 10;
scene.add(camera);

// контроль камеры
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Анимация
const clock = new THREE.Clock();

const tick = () => {
  // обновляем камеру
  controls.update();

  // рендер сцены
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
