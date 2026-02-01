// src/entities/vehicles/DynamicRayCastVehicleController.js
import * as THREE from "three";

export class DynamicRayCastVehicleController {
  constructor(game) {
    this.game = game;
    this.RAPIER = game.RAPIER;
    this.world = game.physics.world;

    // Параметры шасси
    this.chassisConfig = {
      width: 1.0, // ширина кузова (метры)
      height: 0.5, // высота кузова
      length: 3.0, // длина кузова
      mass: 500, // масса (кг)
    };

    // Параметры колёс
    this.wheelConfig = {
      radius: 0.35, // радиус колеса
      suspensionRestLength: 0.3, // длина подвески в покое
      suspensionStiffness: 24.0, // жёсткость пружины
      maxSuspensionTravel: 0.25, // макс. ход подвески
      suspensionDamping: 2.3, // демпфирование (гашение)
      frictionSlip: 2.0, // коэффициент трения/скольжения
    };

    // Состояние управления
    this.engineForce = 0; // текущая сила двигателя
    this.steering = 0; // текущий угол руля
    this.brakeForce = 0; // текущая сила торможения

    // Максимальные значения
    this.maxEngineForce = 2000; // макс. тяга
    this.maxSteeringAngle = Math.PI / 6; // макс. угол руля (30°)
    this.maxBrakeForce = 50; // макс. тормоз

    // Скорость отклика руля
    this.steeringSpeed = 3.0;
    this.steeringReturnSpeed = 5.0;

    this.init();
  }

  init() {
    this.createChassis(); // Rapier rigid body
    this.createVehicleController(); //  Колёса и подвеска
    this.createWheelMeshes();
  }

  createChassis() {
    const { width, height, length } = this.chassisConfig;

    // Three.js меш для шасси
    const chassisGeometry = new THREE.BoxGeometry(width, height, length);
    const chassisMaterial = new THREE.MeshStandardMaterial({
      color: 0x2244aa,
      metalness: 0.6,
      roughness: 0.4,
    });
    this.chassisMesh = new THREE.Mesh(chassisGeometry, chassisMaterial);
    this.chassisMesh.castShadow = true;
    this.game.scene.add(this.chassisMesh);

    // Rapier rigid body для шасси
    const chassisBodyDesc = this.RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(0, 2, 0)
      .setCanSleep(false);

    this.chassisBody = this.world.createRigidBody(chassisBodyDesc);

    // Collider для шасси
    const chassisColliderDesc = this.RAPIER.ColliderDesc.cuboid(
      width / 2,
      height / 2,
      length / 2,
    )
      .setMass(this.chassisConfig.mass)
      .setFriction(0.5); // - трение кузова (если врежется во что-то)

    this.world.createCollider(chassisColliderDesc, this.chassisBody); // привязывает коллайдер к rigid body.
  }

  createVehicleController() {
    const { radius, suspensionRestLength, suspensionStiffness, maxSuspensionTravel } =
      this.wheelConfig;
    const { width, length } = this.chassisConfig;

    // Создаём vehicle controller
    this.vehicleController = this.world.createVehicleController(this.chassisBody);

    // Позиции колёс относительно центра шасси
    this.wheelLocalPositions = [
      { x: -width / 2 - 0.1, y: 0, z: length / 2 - 0.3 }, // Переднее левое
      { x: width / 2 + 0.1, y: 0, z: length / 2 - 0.3 }, // Переднее правое
      { x: -width / 2 - 0.1, y: 0, z: -length / 2 + 0.3 }, // Заднее левое
      { x: width / 2 + 0.1, y: 0, z: -length / 2 + 0.3 }, // Заднее правое
    ];

    // Направление подвески (вниз)
    const suspensionDirection = { x: 0, y: -1, z: 0 };
    // Ось вращения колеса (вбок)
    const axleDirection = { x: -1, y: 0, z: 0 };

    this.wheelLocalPositions.forEach((pos, index) => {
      this.vehicleController.addWheel(
        pos, // позиция относительно шасси
        suspensionDirection, // направление луча подвески
        axleDirection, // ось вращения
        suspensionRestLength, // длина подвески в покое (0.3м)
        radius, // радиус колеса (0.35м)
      );

      // Настраиваем подвеску для каждого колеса
      // Жёсткость пружины
      this.vehicleController.setWheelSuspensionStiffness(
        index,
        suspensionStiffness,
      );
      // Максимальный ход подвески
      this.vehicleController.setWheelMaxSuspensionTravel(
        index,
        maxSuspensionTravel,
      );
      // Сжатие (compression) - сопротивление при сжатии
      this.vehicleController.setWheelSuspensionCompression(
        index,
        this.wheelConfig.suspensionDamping * 0.3,
      );
      // Отбой (relaxation) - сопротивление при разжатии
      this.vehicleController.setWheelSuspensionRelaxation(
        index,
        this.wheelConfig.suspensionDamping,
      );
      // Трение/скольжение
      this.vehicleController.setWheelFrictionSlip(
        index,
        this.wheelConfig.frictionSlip,
      );
    });
  }

  createWheelMeshes() {
    this.wheelMeshes = [];

    const wheelGeometry = new THREE.CylinderGeometry(
      this.wheelConfig.radius,
      this.wheelConfig.radius,
      0.2,
      16
    );
    // Поворачиваем геометрию, чтобы цилиндр был ориентирован по оси X
    wheelGeometry.rotateZ(Math.PI / 2);

    const wheelMaterial = new THREE.MeshStandardMaterial({
      color: 0x222222,
      metalness: 0.3,
      roughness: 0.8,
    });

    for (let i = 0; i < 4; i++) {
      const wheelMesh = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheelMesh.castShadow = true;
      this.game.scene.add(wheelMesh);
      this.wheelMeshes.push(wheelMesh);
    }
  }

  handleInput(inputController) {
    const targetSteering = 0;
    let accelerate = false;
    let reverse = false;
    let brake = false;

    // Газ/тормоз
    if (inputController.isPressed("forward")) {
      accelerate = true;
    }
    if (inputController.isPressed("backward")) {
      reverse = true;
    }
    if (inputController.isPressed("brake")) {
      brake = true;
    }

    // Руль
    if (inputController.isPressed("left")) {
      this.steering = Math.min(
        this.steering + this.steeringSpeed * 0.016,
        this.maxSteeringAngle
      );
    } else if (inputController.isPressed("right")) {
      this.steering = Math.max(
        this.steering - this.steeringSpeed * 0.016,
        -this.maxSteeringAngle
      );
    } else {
      // Возврат руля в центр
      if (this.steering > 0) {
        this.steering = Math.max(0, this.steering - this.steeringReturnSpeed * 0.016);
      } else if (this.steering < 0) {
        this.steering = Math.min(0, this.steering + this.steeringReturnSpeed * 0.016);
      }
    }

    // Применяем силы
    if (accelerate) {
      this.engineForce = this.maxEngineForce;
      this.brakeForce = 0;
    } else if (reverse) {
      this.engineForce = -this.maxEngineForce * 0.5;
      this.brakeForce = 0;
    } else if (brake) {
      this.engineForce = 0;
      this.brakeForce = this.maxBrakeForce;
    } else {
      // Нет нажатий - лёгкое торможение чтобы машина не катилась сама
      this.engineForce = 0;
      this.brakeForce = 0.5; // маленькое торможение
    }
  }

  update(deltaTime) {
    // Применяем руление к передним колёсам (индексы 0 и 1)
    this.vehicleController.setWheelSteering(0, this.steering);
    this.vehicleController.setWheelSteering(1, this.steering);

    // Применяем силу двигателя к задним колёсам (индексы 2 и 3) - задний привод
    this.vehicleController.setWheelEngineForce(2, this.engineForce);
    this.vehicleController.setWheelEngineForce(3, this.engineForce);

    // Применяем тормоз ко всем колёсам
    for (let i = 0; i < 4; i++) {
      this.vehicleController.setWheelBrake(i, this.brakeForce);
    }

    // Обновляем vehicle controller
    this.vehicleController.updateVehicle(deltaTime);

    // Синхронизируем меши
    this.syncMeshes();
  }

  syncMeshes() {
    // Синхронизируем шасси
    const chassisPos = this.chassisBody.translation();
    const chassisRot = this.chassisBody.rotation();

    this.chassisMesh.position.set(chassisPos.x, chassisPos.y, chassisPos.z);
    this.chassisMesh.quaternion.set(chassisRot.x, chassisRot.y, chassisRot.z, chassisRot.w);

    // Матрица шасси для трансформации локальных координат колёс в мировые
    const chassisMatrix = new THREE.Matrix4();
    chassisMatrix.compose(
      this.chassisMesh.position,
      this.chassisMesh.quaternion,
      new THREE.Vector3(1, 1, 1)
    );

    // Синхронизируем колёса
    for (let i = 0; i < 4; i++) {
      const localPos = this.wheelLocalPositions[i];
      const suspensionLength = this.vehicleController.wheelSuspensionLength(i);
      const wheelRotation = this.vehicleController.wheelRotation(i);
      const wheelSteering = this.vehicleController.wheelSteering(i);

      // Позиция колеса в локальных координатах (с учётом подвески)
      const wheelLocalPos = new THREE.Vector3(
        localPos.x,
        localPos.y - suspensionLength,
        localPos.z
      );

      // Трансформируем в мировые координаты
      wheelLocalPos.applyMatrix4(chassisMatrix);
      this.wheelMeshes[i].position.copy(wheelLocalPos);

      // Вращение колеса: сначала поворот шасси, потом руление, потом вращение колеса
      const wheelQuaternion = new THREE.Quaternion();
      wheelQuaternion.copy(this.chassisMesh.quaternion);

      // Добавляем руление (для передних колёс)
      if (i < 2) {
        const steeringQuat = new THREE.Quaternion();
        steeringQuat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), wheelSteering);
        wheelQuaternion.multiply(steeringQuat);
      }

      // Добавляем вращение колеса вокруг оси
      const rotationQuat = new THREE.Quaternion();
      rotationQuat.setFromAxisAngle(new THREE.Vector3(1, 0, 0), wheelRotation);
      wheelQuaternion.multiply(rotationQuat);

      this.wheelMeshes[i].quaternion.copy(wheelQuaternion);
    }
  }

  reset() {
    // Сброс позиции машины
    this.chassisBody.setTranslation({ x: 0, y: 2, z: 0 }, true);
    this.chassisBody.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
    this.chassisBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
    this.chassisBody.setAngvel({ x: 0, y: 0, z: 0 }, true);

    this.steering = 0;
    this.engineForce = 0;
    this.brakeForce = 0;
  }

  getPosition() {
    return this.chassisBody.translation();
  }

  getSpeed() {
    const vel = this.chassisBody.linvel();
    return Math.sqrt(vel.x * vel.x + vel.y * vel.y + vel.z * vel.z);
  }

  isMoving() {
    // Машина движется если скорость больше 0.5
    return this.getSpeed() > 0.5;
  }
}
