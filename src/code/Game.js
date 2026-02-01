// src/core/Game.js
import * as THREE from "three";
import RAPIER from "@dimforge/rapier3d-compat";
import { PhysicsWorld } from "./PhysicsWorld.js";
import { CameraController } from "../systems/CameraController.js";
import { LightingSystem } from "../systems/LightingSystem.js";
import { InputController } from "../systems/InputController.js";
import { Debug } from "../utils/Debug.js";
import { DynamicRayCastVehicleController } from "../entities/vehicles/DynamicRayCastVehicleController.js";

export class Game {
  constructor() {
    this.clock = new THREE.Clock();
    this.RAPIER = null; // сохраним ссылку на RAPIER
    this.init();
  }

  async init() {
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

    const axesHelper = new THREE.AxesHelper(5);
       this.scene.add(axesHelper);

    // Input Controller
    this.inputController = new InputController([
      { name: "forward", keys: ["ArrowUp", "KeyW"] },
      { name: "backward", keys: ["ArrowDown", "KeyS"] },
      { name: "left", keys: ["ArrowLeft", "KeyA"] },
      { name: "right", keys: ["ArrowRight", "KeyD"] },
      { name: "brake", keys: ["Space"] },
      { name: "reset", keys: ["KeyR"] },
      { name: "cameraToggle", keys: ["KeyC"] },
      { name: "myCameraToogle", keys: ["KeyE"] },
    ]);

    // Lighting System
    this.lightingSystem = new LightingSystem(this.scene);

    // Включаем цикл день/ночь с реальным временем
    this.lightingSystem.updateSunPosition();

    // Physics - инициализируем асинхронно
    this.physics = new PhysicsWorld();
    this.RAPIER = await this.physics.init(); // получаем RAPIER обратно

    // Resize handler
    window.addEventListener("resize", () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // После инициализации физики создаём сцену
    this.createTestScene();
    this.setupDebug();
    this.animate();
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
    // Используем сохранённую ссылку на RAPIER
    const RAPIER = this.RAPIER;

    // Пол (плоскость) - увеличиваем для тестов
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x3a5f0b,
      side: THREE.DoubleSide,
    });
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    this.scene.add(groundMesh);

    // Физическое тело для пола (статичное)
    const groundBodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(0, 0, 0);
    const groundBody = this.physics.world.createRigidBody(groundBodyDesc);

    // Используем halfExtents для создания плоского box (100x0.1x100)
    const groundColliderDesc = RAPIER.ColliderDesc.cuboid(50, 0.1, 50);
    this.physics.world.createCollider(groundColliderDesc, groundBody);

    // Создаём машину с raycast vehicle controller
    this.vehicle = new DynamicRayCastVehicleController(this);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const deltaTime = this.clock.getDelta();

    // Обновляем системы
    this.cameraController.update(deltaTime, this.vehicle);
    this.lightingSystem.update(deltaTime);

    // Обновляем машину
    if (this.vehicle) {
      this.vehicle.handleInput(this.inputController);
      this.vehicle.update(deltaTime);
    }

    this.physics.update(deltaTime);

    // Сброс машины по кнопке R
    if (this.inputController.isJustPressed("reset") && this.vehicle) {
      this.vehicle.reset();
    }

    // Рендерим
    this.renderer.render(this.scene, this.cameraController.getCamera());

    // Сбрасываем justPressed/justReleased в конце кадра
    this.inputController.update();
  }
}
