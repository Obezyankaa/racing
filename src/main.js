import * as THREE from "three";
import * as CANNON from "cannon-es";
import { RectAreaLightHelper } from "three/examples/jsm/Addons.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const canvas = document.querySelector("canvas.webgl");
const scene = new THREE.Scene();

/**
 * Физика
 */
// Виртуальный Мир
const world = new CANNON.World();
world.broadphase = new CANNON.SAPBroadphase(world);
world.allowSleep = true;
world.gravity.set(0, -9.82, 0);

/**
 * Модель
 */
// const gltfLoader = new GLTFLoader();
// gltfLoader.load("/model/Nissan-GTR.glb", (gltf) => {
//   // console.log(gltf);
//   gltf.scene.position.y = -0.1;
//   gltf.scene.scale.set(0.5, 0.5, 0.5); // Уменьшаем модель

//   gltf.scene.traverse((child) => {
//     if (child.isMesh) {
//       child.castShadow = true; // Модель отбрасывает тень
//       child.receiveShadow = true; // Если нужно, чтобы модель принимала тень от других объектов
//     }
//   });

//   scene.add(gltf.scene);
// });

/**
 * Текстуры
 */ const textureLoader = new THREE.TextureLoader();

const diffuse = textureLoader.load("./asphalt/aerial_asphalt_01_diff_1k.jpg");
const normal = textureLoader.load("./asphalt/aerial_asphalt_01_nor_gl_1k.jpg");
const rough = textureLoader.load("./asphalt/aerial_asphalt_01_arm_1k.jpg");

diffuse.colorSpace = THREE.SRGBColorSpace;

diffuse.wrapS = THREE.RepeatWrapping;
diffuse.wrapT = THREE.RepeatWrapping;
diffuse.repeat.set(4, 4);

normal.wrapS = THREE.RepeatWrapping;
normal.wrapT = THREE.RepeatWrapping;
normal.repeat.set(4, 4);

rough.wrapS = THREE.RepeatWrapping;
rough.wrapT = THREE.RepeatWrapping;
rough.repeat.set(4, 4);

/**
 * Свет
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 1, 0); //default; light shining from top
light.castShadow = true; // default false

//Set up shadow properties for the light
light.shadow.mapSize.width = 512; // default
light.shadow.mapSize.height = 512; // default
light.shadow.camera.near = 1; // default
light.shadow.camera.far = 6; // default
scene.add(light);

// const width = 1;
// const height = 4;
// const intensity = 1;
// const rectLight = new THREE.RectAreaLight(0xffffff, intensity, width, height);
// rectLight.position.set(3, 1, 1);
// rectLight.lookAt(0, 0, 0);
// scene.add(rectLight);

// const rectLightHelper = new RectAreaLightHelper(rectLight);
// rectLight.add(rectLightHelper);

/**
 * Объекты на рендере
 */
const material = new THREE.MeshStandardMaterial();
material.roughness = 0.7;

// фигруа
const normalMaterial = new THREE.MeshNormalMaterial();
const phongMaterial = new THREE.MeshPhongMaterial();

const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const cubeMesh = new THREE.Mesh(cubeGeometry, normalMaterial);
cubeMesh.position.x = -3;
cubeMesh.position.y = 3;
cubeMesh.castShadow = true;
scene.add(cubeMesh);
const cubeShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
const cubeBody = new CANNON.Body({ mass: 1 });
cubeBody.addShape(cubeShape);
cubeBody.position.x = cubeMesh.position.x;
cubeBody.position.y = cubeMesh.position.y;
cubeBody.position.z = cubeMesh.position.z;
world.addBody(cubeBody);

// пол
const planeGeometry = new THREE.PlaneGeometry(25, 25);
const planeMesh = new THREE.Mesh(
  planeGeometry,
  new THREE.MeshStandardMaterial({
    map: diffuse,
    normalMap: normal,
    roughnessMap: rough,
  })
);
planeMesh.rotateX(-Math.PI / 2);
planeMesh.receiveShadow = true;
scene.add(planeMesh);
const planeShape = new CANNON.Plane();
const planeBody = new CANNON.Body({ mass: 0 });
planeBody.addShape(planeShape);
planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
world.addBody(planeBody);

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
camera.position.x = 1;
camera.position.y = 1;
camera.position.z = 2;
scene.add(camera);

// контроль камеры
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});

// Включаем тени!
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // по умолчанию PCFShadowMap
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// Анимация
const clock = new THREE.Clock();
let delta;

const tick = () => {
  // обновляем камеру
  controls.update();

  delta = Math.min(clock.getDelta(), 0.1);
  world.step(delta);

  cubeMesh.position.set(
    cubeBody.position.x,
    cubeBody.position.y,
    cubeBody.position.z
  );
  cubeMesh.quaternion.set(
    cubeBody.quaternion.x,
    cubeBody.quaternion.y,
    cubeBody.quaternion.z,
    cubeBody.quaternion.w
  );

  // рендер сцены
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
