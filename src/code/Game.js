// src/core/Game.js
import * as THREE from "three";
import * as CANNON from "cannon-es";
import { PhysicsWorld } from "./PhysicsWorld.js";
import { CameraController } from "../systems/CameraController.js";
import { LightingSystem } from "../systems/LightingSystem.js";
import { InputController } from "../systems/InputController.js";
import { Debug } from "../utils/Debug.js";

export class Game {
  constructor() {
    this.clock = new THREE.Clock();
    this.init();
    this.createTestScene();
    this.setupDebug();
    this.animate();
  }

  init() {
    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    document.body.appendChild(this.renderer.domElement);

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);

    // Camera Controller
    this.cameraController = new CameraController(this.renderer);

    // Input Controller
    this.inputController = new InputController([
      { name: "forward", keys: ["ArrowUp", "KeyW"] },
      { name: "backward", keys: ["ArrowDown", "KeyS"] },
      { name: "left", keys: ["ArrowLeft", "KeyA"] },
      { name: "right", keys: ["ArrowRight", "KeyD"] },
      { name: "brake", keys: ["Space"] },
      { name: "reset", keys: ["KeyR"] },
    ]);

    // Lighting System
    this.lightingSystem = new LightingSystem(this.scene);

    // Включаем цикл день/ночь с реальным временем
    this.lightingSystem.updateSunPosition(true, true);

    // Physics
    this.physics = new PhysicsWorld();

    // Resize handler
    window.addEventListener("resize", () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  setupDebug() {
    // Debug только в dev режиме
    if (import.meta.env.DEV) {
      this.debug = new Debug(this);

      // Горячая клавиша H для показа/скрытия
      window.addEventListener("keydown", (e) => {
        if (e.key === "h" || e.key === "H") {
          this.debug?.toggle();
        }
      });
    }
  }

  createTestScene() {
    // Пол (плоскость)
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x3a5f0b,
      side: THREE.DoubleSide,
    });
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    this.scene.add(groundMesh);

    // Физическое тело для пола
    const groundShape = new CANNON.Plane();
    const groundBody = new CANNON.Body({
      mass: 0,
      shape: groundShape,
    });
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    this.physics.world.addBody(groundBody);

    // Падающий куб
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cubeMesh.position.set(0, 5, 0);
    cubeMesh.castShadow = true;
    this.scene.add(cubeMesh);

    // Физическое тело для куба
    const cubeShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
    const cubeBody = new CANNON.Body({
      mass: 1,
      shape: cubeShape,
      position: new CANNON.Vec3(0, 5, 0),
    });
    this.physics.addBody(cubeBody, cubeMesh);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const deltaTime = this.clock.getDelta();

    // Обновляем системы
    this.inputController.update(); // важно вызывать первым
    this.cameraController.update();
    // this.lightingSystem.update(deltaTime);
    this.physics.update(deltaTime);

    // Тестируем Input (можно удалить потом)
    if (this.inputController.isJustPressed("reset")) {
      console.log("Reset нажат!");
    }

    // Рендерим
    this.renderer.render(this.scene, this.cameraController.getCamera());
  }
}
