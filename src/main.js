import * as THREE from "three";
import { RectAreaLightHelper } from "three/examples/jsm/Addons.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const canvas = document.querySelector("canvas.webgl");
const scene = new THREE.Scene();

/**
 * Модель и сжатие
 */

const gltfLoader = new GLTFLoader();
gltfLoader.load("/model/Nissan-GTR.glb", (gltf) => {
  console.log(gltf);
  gltf.scene.position.y = -0.1;
  gltf.scene.scale.set(0.5, 0.5, 0.5); // Уменьшаем модель

  gltf.scene.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true; // Модель отбрасывает тень
      child.receiveShadow = true; // Если нужно, чтобы модель принимала тень от других объектов
    }
  });

  scene.add(gltf.scene);
});

/**
 * Текстуры 
 */ 
const textureLoader = new THREE.TextureLoader();

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
// scene.add(ambientLight);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 1, 0); //default; light shining from top
light.castShadow = true; // default false

//Set up shadow properties for the light
light.shadow.mapSize.width = 512; // default
light.shadow.mapSize.height = 512; // default
light.shadow.camera.near = 1; // default
light.shadow.camera.far = 6; // default
// scene.add(light);

const width = 1;
const height = 4;
const intensity = 1;
const rectLight = new THREE.RectAreaLight(0xffffff, intensity, width, height);
rectLight.position.set(3, 1, 1);
rectLight.lookAt(0, 0, 0);
scene.add(rectLight);

const rectLightHelper = new RectAreaLightHelper(rectLight);
rectLight.add(rectLightHelper);

/**
 * Объекты на рендере
 */
const material = new THREE.MeshStandardMaterial();
material.roughness = 0.7;

// фигруа
// const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), material);
// sphere.castShadow = true;
// пол

const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(5, 5),
  new THREE.MeshStandardMaterial({
    map: diffuse,
    normalMap: normal,
    roughnessMap: rough,
  })
);
plane.receiveShadow = true;
plane.rotation.x = -Math.PI * 0.5;
plane.position.y = -0.5;

scene.add(plane);

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

const tick = () => {
  // обновляем камеру
  controls.update();

  // рендер сцены
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
