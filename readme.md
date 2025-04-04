# 🚗 Three.js Racing Game Drift

Это соло проект в котором я хочу реализовать игру. 
В игре будет несколько машин, 1 карта, возможность управлять машиной в дрифте, смена суток. 

---

## 📦 Импорты

```js
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RectAreaLightHelper } from "three/examples/jsm/Addons.js";
```

- **THREE** — основной модуль Three.js: сцены, геометрии, материалы и т.д.
- **OrbitControls** — управление камерой мышью.
- **GLTFLoader** — загрузчик 3D-моделей.
- **RectAreaLightHelper** — визуализация RectAreaLight.

---

## 🖼️ Canvas

```js
const canvas = document.querySelector("canvas.webgl");
```
- Указываем HTML-элемент `<canvas>`, в который будет отрисовываться 3D-сцена.

---

## 🌌 Сцена

```js
const scene = new THREE.Scene();
```
- Контейнер для всех 3D-объектов, камеры и света.

---

## 🚘 Загрузка 3D-модели (Nissan GTR)

```js
const gltfLoader = new GLTFLoader();
gltfLoader.load("/model/Nissan-GTR.glb", (gltf) => {
  gltf.scene.position.y = -0.1;
  gltf.scene.scale.set(0.5, 0.5, 0.5);

  gltf.scene.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  scene.add(gltf.scene);
});
```

- Модель масштабируется и настраивается для отрисовки теней.

---

## 🧱 Текстуры для пола

```js
const textureLoader = new THREE.TextureLoader();
const diffuse = textureLoader.load("./asphalt/aerial_asphalt_01_diff_1k.jpg");
const normal = textureLoader.load("./asphalt/aerial_asphalt_01_nor_gl_1k.jpg");
const rough = textureLoader.load("./asphalt/aerial_asphalt_01_arm_1k.jpg");

// Повтор текстур
[diffuse, normal, rough].forEach(tex => {
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
});
diffuse.colorSpace = THREE.SRGBColorSpace;
```

---

## 🔦 Свет

```js
const rectLight = new THREE.RectAreaLight(0xffffff, 1, 1, 4);
rectLight.position.set(3, 1, 1);
rectLight.lookAt(0, 0, 0);
scene.add(rectLight);

const rectLightHelper = new RectAreaLightHelper(rectLight);
rectLight.add(rectLightHelper);
```

- Реалистичный источник света и его помощник.

---

## 🛏️ Пол

```js
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
```

---

## 📊 Рендерер и камера

```js
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(1, 1, 2);
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({ canvas });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
```

---

## ↺ Resize окна

```js
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
```

---

## ⏱️ Цикл анимации

```js
const tick = () => {
  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

tick();
```

---

---

