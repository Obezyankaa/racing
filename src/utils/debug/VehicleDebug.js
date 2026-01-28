// src/utils/debug/VehicleDebug.js
import * as THREE from "three";

export class VehicleDebug {
  constructor(pane, game) {
    this.pane = pane;
    this.game = game;
    this.params = {
      showRaycasts: true,
      showSuspension: true,
      showWheelInfo: true,
      showVelocity: true,
    };

    // Визуальные хелперы
    this.raycastLines = [];
    this.suspensionLines = [];
    this.velocityArrow = null;
    this.wheelInfoSprites = [];

    this.init();
    this.createVisualHelpers();
  }

  init() {
    const vehicleFolder = this.pane.addFolder({ title: "🚗 Vehicle Debug" });

    // Чекбоксы для отображения
    vehicleFolder
      .addBinding(this.params, "showRaycasts", { label: "Show Raycasts" })
      .on("change", () => this.updateVisibility());

    vehicleFolder
      .addBinding(this.params, "showSuspension", { label: "Show Suspension" })
      .on("change", () => this.updateVisibility());

    vehicleFolder
      .addBinding(this.params, "showVelocity", { label: "Show Velocity" })
      .on("change", () => this.updateVisibility());

    // Информация о машине (только для чтения)
    this.vehicleInfo = {
      speed: 0,
      rpm: 0,
      steering: 0,
    };

    const infoFolder = vehicleFolder.addFolder({ title: "Vehicle Info" });

    infoFolder.addBinding(this.vehicleInfo, "speed", {
      readonly: true,
      label: "Speed (km/h)",
      format: (v) => v.toFixed(1),
    });

    infoFolder.addBinding(this.vehicleInfo, "steering", {
      readonly: true,
      label: "Steering (deg)",
      format: (v) => v.toFixed(1),
    });

    // Информация о колёсах
    this.wheelInfo = {
      fl_contact: false,
      fr_contact: false,
      rl_contact: false,
      rr_contact: false,
      fl_suspension: 0,
      fr_suspension: 0,
      rl_suspension: 0,
      rr_suspension: 0,
    };

    const wheelsFolder = vehicleFolder.addFolder({
      expanded: false,
      title: "Wheels",
    });

    // Контакт колёс
    wheelsFolder.addBinding(this.wheelInfo, "fl_contact", {
      readonly: true,
      label: "FL Contact",
    });
    wheelsFolder.addBinding(this.wheelInfo, "fr_contact", {
      readonly: true,
      label: "FR Contact",
    });
    wheelsFolder.addBinding(this.wheelInfo, "rl_contact", {
      readonly: true,
      label: "RL Contact",
    });
    wheelsFolder.addBinding(this.wheelInfo, "rr_contact", {
      readonly: true,
      label: "RR Contact",
    });

    // Подвеска
    wheelsFolder.addBinding(this.wheelInfo, "fl_suspension", {
      readonly: true,
      label: "FL Susp",
      format: (v) => v.toFixed(3),
    });
    wheelsFolder.addBinding(this.wheelInfo, "fr_suspension", {
      readonly: true,
      label: "FR Susp",
      format: (v) => v.toFixed(3),
    });
    wheelsFolder.addBinding(this.wheelInfo, "rl_suspension", {
      readonly: true,
      label: "RL Susp",
      format: (v) => v.toFixed(3),
    });
    wheelsFolder.addBinding(this.wheelInfo, "rr_suspension", {
      readonly: true,
      label: "RR Susp",
      format: (v) => v.toFixed(3),
    });

    // Кнопка сброса
    vehicleFolder.addButton({ title: "Reset Vehicle (R)" }).on("click", () => {
      if (this.game.vehicle) {
        this.game.vehicle.reset();
      }
    });

    // Запускаем обновление
    this.startUpdate();
  }

  createVisualHelpers() {
    const scene = this.game.scene;

    // Материалы для линий
    const raycastMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
    const raycastNoContactMaterial = new THREE.LineBasicMaterial({
      color: 0xff0000,
    });
    const suspensionMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 });

    // Создаём линии для каждого колеса
    for (let i = 0; i < 4; i++) {
      // Raycast линия
      const raycastGeometry = new THREE.BufferGeometry();
      raycastGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute([0, 0, 0, 0, -1, 0], 3)
      );
      const raycastLine = new THREE.Line(raycastGeometry, raycastMaterial);
      raycastLine.frustumCulled = false;
      scene.add(raycastLine);
      this.raycastLines.push({
        line: raycastLine,
        contactMaterial: raycastMaterial,
        noContactMaterial: raycastNoContactMaterial,
      });

      // Suspension линия
      const suspensionGeometry = new THREE.BufferGeometry();
      suspensionGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute([0, 0, 0, 0, -0.3, 0], 3)
      );
      const suspensionLine = new THREE.Line(
        suspensionGeometry,
        suspensionMaterial
      );
      suspensionLine.frustumCulled = false;
      scene.add(suspensionLine);
      this.suspensionLines.push(suspensionLine);
    }

    // Стрелка скорости
    this.velocityArrow = new THREE.ArrowHelper(
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(0, 0, 0),
      1,
      0x0088ff
    );
    scene.add(this.velocityArrow);

    this.updateVisibility();
  }

  updateVisibility() {
    this.raycastLines.forEach((r) => (r.line.visible = this.params.showRaycasts));
    this.suspensionLines.forEach(
      (l) => (l.visible = this.params.showSuspension)
    );
    if (this.velocityArrow) {
      this.velocityArrow.visible = this.params.showVelocity;
    }
  }

  startUpdate() {
    const update = () => {
      if (this.game.vehicle) {
        this.updateDebugInfo();
        this.updateVisualHelpers();
      }
      requestAnimationFrame(update);
    };
    update();
  }

  updateDebugInfo() {
    const vehicle = this.game.vehicle;
    const vc = vehicle.vehicleController;

    // Обновляем основную информацию
    this.vehicleInfo.speed = vehicle.getSpeed() * 3.6; // м/с -> км/ч
    this.vehicleInfo.steering = (vehicle.steering * 180) / Math.PI;

    // Обновляем информацию о колёсах
    const wheelNames = ["fl", "fr", "rl", "rr"];
    for (let i = 0; i < 4; i++) {
      const prefix = wheelNames[i];
      this.wheelInfo[`${prefix}_contact`] = vc.wheelIsInContact(i);
      this.wheelInfo[`${prefix}_suspension`] = vc.wheelSuspensionLength(i);
    }
  }

  updateVisualHelpers() {
    const vehicle = this.game.vehicle;
    const vc = vehicle.vehicleController;
    const chassisPos = vehicle.chassisBody.translation();
    const chassisRot = vehicle.chassisBody.rotation();

    // Матрица шасси
    const chassisMatrix = new THREE.Matrix4();
    const chassisQuaternion = new THREE.Quaternion(
      chassisRot.x,
      chassisRot.y,
      chassisRot.z,
      chassisRot.w
    );
    chassisMatrix.compose(
      new THREE.Vector3(chassisPos.x, chassisPos.y, chassisPos.z),
      chassisQuaternion,
      new THREE.Vector3(1, 1, 1)
    );

    // Обновляем линии для каждого колеса
    for (let i = 0; i < 4; i++) {
      const localPos = vehicle.wheelLocalPositions[i];
      const suspensionLength = vc.wheelSuspensionLength(i);
      const isInContact = vc.wheelIsInContact(i);
      const wheelRadius = vehicle.wheelConfig.radius;
      const restLength = vehicle.wheelConfig.suspensionRestLength;

      // Начало луча (в мировых координатах)
      const rayStart = new THREE.Vector3(localPos.x, localPos.y, localPos.z);
      rayStart.applyMatrix4(chassisMatrix);

      // Конец луча (точка контакта или максимальная длина)
      const rayEnd = new THREE.Vector3(
        localPos.x,
        localPos.y - restLength - wheelRadius,
        localPos.z
      );
      rayEnd.applyMatrix4(chassisMatrix);

      // Обновляем геометрию raycast линии
      const raycastPositions =
        this.raycastLines[i].line.geometry.attributes.position.array;
      raycastPositions[0] = rayStart.x;
      raycastPositions[1] = rayStart.y;
      raycastPositions[2] = rayStart.z;
      raycastPositions[3] = rayEnd.x;
      raycastPositions[4] = rayEnd.y;
      raycastPositions[5] = rayEnd.z;
      this.raycastLines[i].line.geometry.attributes.position.needsUpdate = true;

      // Меняем цвет в зависимости от контакта
      this.raycastLines[i].line.material = isInContact
        ? this.raycastLines[i].contactMaterial
        : this.raycastLines[i].noContactMaterial;

      // Обновляем линию подвески
      const suspStart = new THREE.Vector3(localPos.x, localPos.y, localPos.z);
      suspStart.applyMatrix4(chassisMatrix);

      const suspEnd = new THREE.Vector3(
        localPos.x,
        localPos.y - suspensionLength,
        localPos.z
      );
      suspEnd.applyMatrix4(chassisMatrix);

      const suspPositions =
        this.suspensionLines[i].geometry.attributes.position.array;
      suspPositions[0] = suspStart.x;
      suspPositions[1] = suspStart.y;
      suspPositions[2] = suspStart.z;
      suspPositions[3] = suspEnd.x;
      suspPositions[4] = suspEnd.y;
      suspPositions[5] = suspEnd.z;
      this.suspensionLines[i].geometry.attributes.position.needsUpdate = true;
    }

    // Обновляем стрелку скорости
    if (this.velocityArrow) {
      const vel = vehicle.chassisBody.linvel();
      const velocity = new THREE.Vector3(vel.x, vel.y, vel.z);
      const speed = velocity.length();

      this.velocityArrow.position.set(chassisPos.x, chassisPos.y + 1, chassisPos.z);

      if (speed > 0.1) {
        velocity.normalize();
        this.velocityArrow.setDirection(velocity);
        this.velocityArrow.setLength(Math.min(speed * 0.5, 5));
        this.velocityArrow.visible = this.params.showVelocity;
      } else {
        this.velocityArrow.visible = false;
      }
    }
  }

  dispose() {
    // Удаляем все визуальные хелперы
    this.raycastLines.forEach((r) => {
      this.game.scene.remove(r.line);
      r.line.geometry.dispose();
    });
    this.suspensionLines.forEach((l) => {
      this.game.scene.remove(l);
      l.geometry.dispose();
    });
    if (this.velocityArrow) {
      this.game.scene.remove(this.velocityArrow);
    }
  }
}
