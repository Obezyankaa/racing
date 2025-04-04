# Three.js — Стартер и Объяснения

Этот README-файл содержит пошаговые пояснения к стартовому шаблону проекта на Three.js. Он поможет понять, что делает каждая часть кода, и как это используется на практике. 
---

## 📦 Импорты
```js
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
```
- **THREE** — основной модуль Three.js: сцены, камеры, рендереры и т.д.
- **OrbitControls** — позволяет управлять камерой мышью. Подключается отдельно из examples.

📘 Документация:
- [OrbitControls](https://threejs.org/docs/#examples/en/controls/OrbitControls)
- [Three.js](https://threejs.org/docs/#manual/en/introduction/Creating-a-scene)

---

## 🎯 Canvas (холст)
```js
const canvas = document.querySelector("canvas.webgl");
```
- Получаем элемент `<canvas>` из HTML, на который будет рендериться 3D-сцена.

---

## 🌌 Сцена
```js
const scene = new THREE.Scene();
```
- Основной контейнер для всех 3D-объектов, камеры и источников света.

---

## 📏 Размеры экрана
```js
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
```
- Объект для хранения текущих размеров окна. Используется при инициализации и при ресайзе.

---

## 🧩 Адаптация под resize
```js
window.addEventListener("resize", () => {
  // обновляем размеры
  // обновляем aspect камеры
  // обновляем размер рендерера
});
```
- Обновляем:
  - `sizes`
  - `aspect` камеры (обязательно вызвать `updateProjectionMatrix()`)
  - размер рендерера и `pixelRatio`

---

## 🎥 Камера
```js
const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 100);
camera.position.z = 3;
scene.add(camera);
```
- `PerspectiveCamera` — даёт эффект перспективы (как в реальной жизни).
- Параметры:
  - `fov` — угол обзора
  - `aspect` — соотношение сторон
  - `near/far` — плоскости отсечения

---

## 🕹️ OrbitControls
```js
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
```
- Управление камерой с помощью мыши.
- `enableDamping = true` — сглаживает движения (анимация).

---

## 🖥️ Рендерер
```js
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(width, height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
```
- Рендеринг сцены на канвас с помощью WebGL.
- `pixelRatio` ограничивается для повышения производительности.

📘 [WebGLRenderer](https://threejs.org/docs/#api/en/renderers/WebGLRenderer)

---

## ⏱️ Clock
```js
const clock = new THREE.Clock();
```
- Используется для расчёта времени между кадрами и анимации.

---

## 🔁 Цикл анимации
```js
const tick = () => {
  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

tick();
```
- Главный цикл обновления.
- `requestAnimationFrame` запускает `tick()` на каждый кадр (~60 FPS).
- `controls.update()` обязателен при `enableDamping = true`.

---

