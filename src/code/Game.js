// src/core/Game.js
import * as THREE from "three";
import RAPIER from "@dimforge/rapier3d-compat";
import { PhysicsWorld } from "./PhysicsWorld.js";
import { CameraController } from "../systems/CameraController.js";
import { LightingSystem } from "../systems/LightingSystem.js";
import { InputController } from "../systems/InputController.js";
import { Debug } from "../utils/Debug.js";

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

    // Физическое тело для пола (статичное)
    const groundBodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(0, 0, 0);
    const groundBody = this.physics.world.createRigidBody(groundBodyDesc);

    // Используем halfExtents для создания плоского box (20x0.1x20)
    const groundColliderDesc = RAPIER.ColliderDesc.cuboid(10, 0.1, 10);
    this.physics.world.createCollider(groundColliderDesc, groundBody);

    // Падающий куб
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cubeMesh.position.set(0, 5, 0);
    cubeMesh.castShadow = true;
    this.scene.add(cubeMesh);

    // Физическое тело для куба (динамическое)
    const cubeBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(0, 5, 0);
    const cubeBody = this.physics.world.createRigidBody(cubeBodyDesc);

    const cubeColliderDesc = RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5);
    this.physics.world.createCollider(cubeColliderDesc, cubeBody);

    this.physics.addBody(cubeBody, cubeMesh);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const deltaTime = this.clock.getDelta();

    // Обновляем системы
    this.inputController.update(); // важно вызывать первым
    this.cameraController.update();
    this.lightingSystem.update(deltaTime);
    this.physics.update(deltaTime);

    // Тестируем Input (можно удалить потом)
    if (this.inputController.isJustPressed("reset")) {
      console.log("Reset нажат!");
    }

    // Рендерим
    this.renderer.render(this.scene, this.cameraController.getCamera());
  }
}
