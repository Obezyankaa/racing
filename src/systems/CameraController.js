// src/systems/CameraController.js
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export class CameraController {
  constructor(renderer) {
    this.renderer = renderer;

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    this.camera.position.set(5, 5, 5);
    this.camera.lookAt(0, 0, 0);

    // Orbit Controls (для свободного режима)
    this.controls = new OrbitControls(this.camera, renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 50;
    this.controls.maxPolarAngle = Math.PI / 2;

    // Режим камеры: "free", "follow", "orbit"
    // free - свободная камера (OrbitControls)
    // follow - камера едет за машиной сзади
    // orbit - камера на фиксированной высоте, смотрит на машину
    this.mode = "default";

    // Настройки режима orbit (наблюдение сверху)
    this.orbitConfig = {
      offset: new THREE.Vector3(5, 5, 5), // смещение от машины
      smoothSpeed: 3,
    };

    // Настройки режима следования
    this.followConfig = {
      distance: 8, // расстояние от машины
      height: 3, // высота над машиной
      lookAheadDistance: 5, // смотреть вперёд
      smoothSpeed: 5, // скорость сглаживания
    };

    // Текущая позиция камеры (для сглаживания)
    this.currentPosition = new THREE.Vector3();
    this.currentLookAt = new THREE.Vector3();

    // Сохраняем позицию свободной камеры при переключении
    this.savedFreePosition = new THREE.Vector3();
    this.savedFreeTarget = new THREE.Vector3();

    // Обработка изменения размера окна
    this.handleResize();
    window.addEventListener("resize", () => this.handleResize());
  }

  handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  changeMode(name) {
    console.log(name, "name");
    this.mode = name;
  }

  toggleFollowMode(vehicle = null) {
    // Переключение: orbit -> follow -> orbit -> follow ...
    // (free режим пока не используем в цикле)

    // Инициализируем текущую позицию для плавного перехода
    this.currentPosition.copy(this.camera.position);
    if (vehicle && vehicle.chassisMesh) {
      this.currentLookAt.copy(vehicle.chassisMesh.position);
    }

    if (this.mode === "orbit") {
      // orbit -> follow (камера за машиной)
      this.mode = "follow";
      this.controls.enabled = false;
    } else if (this.mode === "follow") {
      // follow -> orbit (камера сверху-сбоку)
      this.mode = "orbit";
      this.controls.enabled = false;
    }
  }

  update(deltaTime = 0, vehicle = null) {
    if (this.mode === "free") {
      // this.controls.update();
    } else if (this.mode === "follow" && vehicle) {
      this.updateFollowMode(deltaTime, vehicle);
    } else if (this.mode === "default" && vehicle) {
      console.log('default');
    } else if (this.mode === "observe" && vehicle) {
      this.updateObserveMode(deltaTime, vehicle);
    }
  }

  updateObserveMode(deltaTime, vehicle) {
     const { distance, height, lookAheadDistance, smoothSpeed } =
       this.followConfig;
    
      const vehiclePos = vehicle.chassisMesh.position;
    const vehicleQuat = vehicle.chassisMesh.quaternion;
    

    // Вычисляем направление "назад" от машины
    const backDirection = new THREE.Vector3(0.5, 0.3, 0.5);
    backDirection.applyQuaternion(vehicleQuat);

        // Вычисляем направление "вперёд" для точки взгляда
    const forwardDirection = new THREE.Vector3(0, 0.1, 0);
    forwardDirection.applyQuaternion(vehicleQuat);

    // Целевая позиция камеры (сзади и сверху машины)
    const targetPosition = new THREE.Vector3();
    targetPosition.copy(vehiclePos);
    targetPosition.addScaledVector(backDirection, distance);
    targetPosition.y += height;

    // Точка, куда смотрит камера (немного впереди машины)
    const targetLookAt = new THREE.Vector3();
    targetLookAt.copy(vehiclePos);
    targetLookAt.addScaledVector(forwardDirection, lookAheadDistance);
    targetLookAt.y += 1; // немного выше центра машины

    // Сглаживание движения камеры
    const lerpFactor = 1 - Math.exp(-smoothSpeed * deltaTime);

    this.currentPosition.lerp(targetPosition, lerpFactor);
    this.currentLookAt.lerp(targetLookAt, lerpFactor);

    // Применяем к камере
    this.camera.position.copy(this.currentPosition);
    this.camera.lookAt(this.currentLookAt);
  }

  updateFollowMode(deltaTime, vehicle) {
    const { distance, height, lookAheadDistance, smoothSpeed } =
      this.followConfig;

    // Получаем позицию и направление машины
    const vehiclePos = vehicle.chassisMesh.position;
    const vehicleQuat = vehicle.chassisMesh.quaternion;

    // Вычисляем направление "назад" от машины
    const backDirection = new THREE.Vector3(0, 0, -1);
    backDirection.applyQuaternion(vehicleQuat);

    // Вычисляем направление "вперёд" для точки взгляда
    const forwardDirection = new THREE.Vector3(0, 0, 1);
    forwardDirection.applyQuaternion(vehicleQuat);

    // Целевая позиция камеры (сзади и сверху машины)
    const targetPosition = new THREE.Vector3();
    targetPosition.copy(vehiclePos);
    targetPosition.addScaledVector(backDirection, distance);
    targetPosition.y += height;

    // Точка, куда смотрит камера (немного впереди машины)
    const targetLookAt = new THREE.Vector3();
    targetLookAt.copy(vehiclePos);
    targetLookAt.addScaledVector(forwardDirection, lookAheadDistance);
    targetLookAt.y += 1; // немного выше центра машины

    // Сглаживание движения камеры
    const lerpFactor = 1 - Math.exp(-smoothSpeed * deltaTime);

    this.currentPosition.lerp(targetPosition, lerpFactor);
    this.currentLookAt.lerp(targetLookAt, lerpFactor);

    // Применяем к камере
    this.camera.position.copy(this.currentPosition);
    this.camera.lookAt(this.currentLookAt);
  }

  // Установить цель следования (для плавного старта)
  setFollowTarget(vehicle) {
    if (vehicle) {
      this.currentPosition.copy(this.camera.position);
      this.currentLookAt.copy(vehicle.chassisMesh.position);
    }
  }

  getCamera() {
    return this.camera;
  }

  getMode() {
    return this.mode;
  }

  dispose() {
    this.controls.dispose();
    window.removeEventListener("resize", this.handleResize);
  }
}
