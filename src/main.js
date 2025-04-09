// main.js
import App from "./core/App.js";

const canvas = document.querySelector("canvas.webgl");
const app = new App(canvas);

// import * as THREE from "three";
// import * as CANNON from "cannon-es";
// import CannonDebugger from "cannon-es-debugger";
// import GUI from "lil-gui";
// import { RectAreaLightHelper } from "three/examples/jsm/Addons.js";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// const gui = new GUI();
// const debugObject = {};

// const canvas = document.querySelector("canvas.webgl");
// const scene = new THREE.Scene();
// /**
//  * Физика
//  */
// // Виртуальный Мир
// const world = new CANNON.World();
// world.broadphase = new CANNON.SAPBroadphase(world);
// world.allowSleep = true;
// world.gravity.set(0, -9.82, 0);
// const defaultMaterial = new CANNON.Material("default");

// const cannonDebugger = new CannonDebugger(scene, world, {});

// /**
//  * Модель
//  */
// // const gltfLoader = new GLTFLoader();
// // gltfLoader.load("/model/Nissan-GTR.glb", (gltf) => {
// //   // console.log(gltf);
// //   gltf.scene.position.y = -0.1;
// //   gltf.scene.scale.set(0.5, 0.5, 0.5); // Уменьшаем модель

// //   gltf.scene.traverse((child) => {
// //     if (child.isMesh) {
// //       child.castShadow = true; // Модель отбрасывает тень
// //       child.receiveShadow = true; // Если нужно, чтобы модель принимала тень от других объектов
// //     }
// //   });

// //   scene.add(gltf.scene);
// // });

// /**
//  * Текстуры
//  */ const textureLoader = new THREE.TextureLoader();

// const diffuse = textureLoader.load("./asphalt/aerial_asphalt_01_diff_1k.jpg");
// const normal = textureLoader.load("./asphalt/aerial_asphalt_01_nor_gl_1k.jpg");
// const rough = textureLoader.load("./asphalt/aerial_asphalt_01_arm_1k.jpg");

// diffuse.colorSpace = THREE.SRGBColorSpace;

// diffuse.wrapS = THREE.RepeatWrapping;
// diffuse.wrapT = THREE.RepeatWrapping;
// diffuse.repeat.set(4, 4);

// normal.wrapS = THREE.RepeatWrapping;
// normal.wrapT = THREE.RepeatWrapping;
// normal.repeat.set(4, 4);

// rough.wrapS = THREE.RepeatWrapping;
// rough.wrapT = THREE.RepeatWrapping;
// rough.repeat.set(4, 4);

// /**
//  * Свет
//  */
// const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
// scene.add(ambientLight);

// const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
// directionalLight.position.set(5, 10, 5); //default; light shining from top
// directionalLight.castShadow = true;

// directionalLight.shadow.mapSize.width = 512; // default
// directionalLight.shadow.mapSize.height = 512; // default
// directionalLight.shadow.camera.near = 0.5; // default
// directionalLight.shadow.camera.far = 20; // default
// scene.add(directionalLight);

// //Create a helper for the shadow camera (optional)
// const helper = new THREE.CameraHelper(directionalLight.shadow.camera);
// scene.add(helper);

// // Объект с параметрами, которые будем менять через GUI
// const debugLight = {
//   showHelper: true, // ← helper включён по умолчанию
//   color: directionalLight.color.getHex(),
//   intensity: directionalLight.intensity,
//   x: directionalLight.position.x,
//   y: directionalLight.position.y,
//   z: directionalLight.position.z,
// };

// const lightFolder = gui.addFolder("💡 Свет");
// const oneFolder = lightFolder.addFolder("directionalLight");

// // включить helper
// oneFolder
//   .add(debugLight, "showHelper")
//   .name("Показать Helper")
//   .onChange((val) => {
//     helper.visible = val;
//   });

// // Интенсивность света
// oneFolder
//   .add(directionalLight, "intensity")
//   .min(0)
//   .max(2)
//   .step(0.01)
//   .name("Интенсивность");

// // Цвет света
// oneFolder
//   .addColor(debugLight, "color")
//   .name("Цвет")
//   .onChange((value) => {
//     directionalLight.color.set(value);
//   });

// // Положение источника света
// oneFolder
//   .add(debugLight, "x", -20, 20)
//   .step(0.1)
//   .name("X")
//   .onChange((v) => {
//     directionalLight.position.x = v;
//   });
// oneFolder
//   .add(debugLight, "y", -20, 20)
//   .step(0.1)
//   .name("Y")
//   .onChange((v) => {
//     directionalLight.position.y = v;
//   });
// oneFolder
//   .add(debugLight, "z", -20, 20)
//   .step(0.1)
//   .name("Z")
//   .onChange((v) => {
//     directionalLight.position.z = v;
//   });

// /**
// * Машина
// */
// const carBody = new CANNON.Body({
//   mass: 150,
//   position: new CANNON.Vec3(0, 6, 0),
//   shape: new CANNON.Box(new CANNON.Vec3(4,0.5,2))
// })

// const vehicle = new CANNON.RigidVehicle({
//   chassisBody: carBody
// })

// const mass = 1;
// const axisWidth = 5;
// const wheelShape = new CANNON.Sphere(1);
// const wheelMaterial = new CANNON.Material("wheel");
// const down = new CANNON.Vec3(0, -1, 0);

// const wheelBody1 = new CANNON.Body({ mass, material: wheelMaterial });
// wheelBody1.addShape(wheelShape);
// wheelBody1.angularDamping = 0.4;
// vehicle.addWheel({
//   body: wheelBody1,
//   position: new CANNON.Vec3(-2, 0, axisWidth / 2),
//   axis: new CANNON.Vec3(0, 0, 1),
//   direction: down,
// });

// const wheelBody2 = new CANNON.Body({ mass, material: wheelMaterial });
// wheelBody2.addShape(wheelShape);
// wheelBody2.angularDamping = 0.4;
// vehicle.addWheel({
//   body: wheelBody2,
//   position: new CANNON.Vec3(-2, 0, -axisWidth / 2),
//   axis: new CANNON.Vec3(0, 0, 1),
//   direction: down,
// })

// const wheelBody3 = new CANNON.Body({ mass, material: wheelMaterial });
// wheelBody3.addShape(wheelShape);
// wheelBody3.angularDamping = 0.4;
// vehicle.addWheel({
//   body: wheelBody3,
//   position: new CANNON.Vec3(2, 0, axisWidth / 2),
//   axis: new CANNON.Vec3(0, 0, 1),
//   direction: down,
// });

// const wheelBody4 = new CANNON.Body({ mass, material: wheelMaterial });
// wheelBody4.addShape(wheelShape);
// wheelBody4.angularDamping = 0.4;
// vehicle.addWheel({
//   body: wheelBody4,
//   position: new CANNON.Vec3(2, 0, -axisWidth / 2),
//   axis: new CANNON.Vec3(0, 0, 1),
//   direction: down,
// });

// vehicle.addToWorld(world);

// /**
//  * Объекты на рендере
//  */

// // фигруа
// // const sphereGeometry = new THREE.BoxGeometry(1, 1, 1);
// // const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
// // const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
// // sphere.position.x = 0;
// // sphere.position.y = 2;
// // sphere.castShadow = true; //default is false
// // sphere.receiveShadow = false; //default
// // scene.add(sphere);
// // const cubeShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
// // const cubeBody = new CANNON.Body({ mass: 1 });
// // cubeBody.addShape(cubeShape);
// // cubeBody.position.x = sphere.position.x;
// // cubeBody.position.y = sphere.position.y;
// // cubeBody.position.z = sphere.position.z;
// // world.addBody(cubeBody);

// // Материал для тел

// // Свойства столкновений
// const defaultContactMaterial = new CANNON.ContactMaterial(
//   defaultMaterial,
//   defaultMaterial,
//   {
//     friction: 0.1, // Трение
//     restitution: 0.3, // Упругость
//   }
// );
// world.addContactMaterial(defaultContactMaterial);
// world.defaultContactMaterial = defaultContactMaterial;

// // пол
// const planeGeometry = new THREE.PlaneGeometry(20, 20, 32, 32);
// const planeMaterial = new THREE.MeshStandardMaterial({
//   map: diffuse,
//   normalMap: normal,
//   roughnessMap: rough,
// });
// const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
// planeMesh.rotateX(-Math.PI / 2);
// planeMesh.receiveShadow = true;
// scene.add(planeMesh);
// const planeShape = new CANNON.Plane();
// const planeBody = new CANNON.Body({ mass: 0 });
// planeBody.addShape(planeShape);
// planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
// world.addBody(planeBody);

// const sizes = {
//   width: window.innerWidth,
//   height: window.innerHeight,
// };

// // 🧩 Обработка ресайза
// window.addEventListener("resize", () => {
//   // Update sizes
//   sizes.width = window.innerWidth;
//   sizes.height = window.innerHeight;

//   // Update camera
//   camera.aspect = sizes.width / sizes.height;
//   camera.updateProjectionMatrix();

//   // Update renderer
//   renderer.setSize(sizes.width, sizes.height);
//   renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// });

// /**
//  * Камера
//  */
// // базовая камера
// const camera = new THREE.PerspectiveCamera(
//   75,
//   sizes.width / sizes.height,
//   0.1,
//   100
// );
// camera.position.x = 2;
// camera.position.y = 2;
// camera.position.z = 3;
// scene.add(camera);

// // контроль камеры
// const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;

// const renderer = new THREE.WebGLRenderer({
//   canvas: canvas,
// });

// // Включаем тени!
// renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.PCFSoftShadowMap; // по умолчанию PCFShadowMap
// renderer.setSize(sizes.width, sizes.height);
// renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// // Анимация
// const clock = new THREE.Clock();
// let delta;

// const tick = () => {
//   // обновляем камеру
//   controls.update();
//   helper.update();

//   delta = Math.min(clock.getDelta(), 0.1);
//   world.step(delta);

//   // sphere.position.set(
//   //   cubeBody.position.x,
//   //   cubeBody.position.y,
//   //   cubeBody.position.z
//   // );
//   // sphere.quaternion.set(
//   //   cubeBody.quaternion.x,
//   //   cubeBody.quaternion.y,
//   //   cubeBody.quaternion.z,
//   //   cubeBody.quaternion.w
//   // );

//    document.addEventListener("keydown", (event) => {
//       const maxSteerVal = 0.5;
//       const maxForce = 1000;

//      switch (event.key) {
//        case "w":
//        case "ArrowUp":
//          vehicle.setWheelForce(maxForce, 0);
//          vehicle.setWheelForce(maxForce, 1);
//          break;

//        case "s":
//        case "ArrowDown":
//          vehicle.setWheelForce(-maxForce / 2, 0);
//          vehicle.setWheelForce(-maxForce / 2, 1);
//          break;

//        case "a":
//        case "ArrowLeft":
//          vehicle.setSteeringValue(maxSteerVal, 0);
//          vehicle.setSteeringValue(maxSteerVal, 1);
//          break;

//        case "d":
//        case "ArrowRight":
//          vehicle.setSteeringValue(-maxSteerVal, 0);
//          vehicle.setSteeringValue(-maxSteerVal, 1);
//          break;
//      }
//    });

//    // reset car force to zero when key is released
//    document.addEventListener("keyup", (event) => {
//      switch (event.key) {
//        case "w":
//        case "ArrowUp":
//          vehicle.setWheelForce(0, 0);
//          vehicle.setWheelForce(0, 1);
//          break;

//        case "s":
//        case "ArrowDown":
//          vehicle.setWheelForce(0, 0);
//          vehicle.setWheelForce(0, 1);
//          break;

//        case "a":
//        case "ArrowLeft":
//          vehicle.setSteeringValue(0, 0);
//          vehicle.setSteeringValue(0, 1);
//          break;

//        case "d":
//        case "ArrowRight":
//          vehicle.setSteeringValue(0, 0);
//          vehicle.setSteeringValue(0, 1);
//          break;
//      }
//    });

//   // для отклатки
//   cannonDebugger.update();
//   // рендер сцены
//   renderer.render(scene, camera);

//   // Call tick again on the next frame
//   window.requestAnimationFrame(tick);
// };

// tick();
