import * as THREE from "three";
import * as CANNON from "cannon-es";

const WHEEL_RADIUS = 0.4;

export default class Car {
  constructor(scene) {
    const chassisShape = new CANNON.Box(new CANNON.Vec3(2, 0.5, 1));
    const chassisBody = new CANNON.Body({ mass: 300 });
    chassisBody.addShape(chassisShape);
    chassisBody.position.set(0, 1.5, 0);
    chassisBody.angularVelocity.set(0, -0.5, 0);

    const geometry = new THREE.BoxGeometry(4, 1, 2);
    const material = new THREE.MeshStandardMaterial({
      color: 0xff3333,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    scene.add(mesh);

    this.wheelMeshes = [];

    this.body = chassisBody;
    this.mesh = mesh;
    // Create the vehicle
    const vehicle = new CANNON.RaycastVehicle({
      chassisBody,
    });

    const wheelOptions = {
      radius: WHEEL_RADIUS,
      // •  радиус колеса
      // •	влияет на:
      // •	клиренс
      // •	визуальное положение
      // •	момент контакта с землёй
      directionLocal: new CANNON.Vec3(0, -1, 0),
      // навравление луча подвески
      suspensionStiffness: 30,
      // длина подвески в спокойном состоянии
      // Простыми словами:
      // маленькое → жёсткая машина
      // большое → мягкая, «лодка»
      suspensionRestLength: 0.3,
      frictionSlip: 1.4,
      //  • чем больше — тем больше сцепление
      //  • позже это станет «асфальт / лёд / грязь»
      dampingRelaxation: 2.3,
      dampingCompression: 4.4,
      maxSuspensionForce: 100000,
      // • влияет на переворачивание машины
      // 📌 Для начала:
      // 	• маленькое значение = стабильнее
      // 	• большое = машина «заваливается»
      rollInfluence: 0.01,
      axleLocal: new CANNON.Vec3(0, 0, 1),
      chassisConnectionPointLocal: new CANNON.Vec3(-1, 0, 1),
      maxSuspensionTravel: 0.3,
      customSlidingRotationalSpeed: -30,
      useCustomSlidingRotationalSpeed: true,
    };

    const wheelPositions = [
      new THREE.Vector3(-1, -0.3, 1), // front-left
      new THREE.Vector3(1, -0.3, 1), // front-right
      new THREE.Vector3(-1, -0.3, -1), // rear-left
      new THREE.Vector3(1, -0.3, -1), // rear-right
    ];

    wheelPositions.forEach(([x, y, z]) => {
      wheelOptions.chassisConnectionPointLocal.set(x, y, z);
      vehicle.addWheel(wheelOptions);
    });

    wheelPositions.forEach((pos) => {
      const wheel = this._createWheelMesh(WHEEL_RADIUS);

      // ВАЖНО: это ЛОКАЛЬНАЯ позиция относительно корпуса
      wheel.position.copy(pos);

      // Добавляем колесо ВНУТРЬ корпуса
      this.mesh.add(wheel);
      this.wheelMeshes.push(wheel);
    });
    this.vehicle = vehicle;

    // В Car constructor
    this.suspensionLines = [];

    for (let i = 0; i < 4; i++) {
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(),
        new THREE.Vector3(),
      ]);

      const material = new THREE.LineBasicMaterial({ color: 0xffff00 });
      const line = new THREE.Line(geometry, material);

      scene.add(line);
      this.suspensionLines.push(line);
    }
  }

  update() {
    // синхронизация корпуса
    this.mesh.position.copy(this.body.position);
    this.mesh.quaternion.copy(this.body.quaternion);

    // обновляем колёса (если ты это уже делаешь)
    for (let i = 0; i < this.vehicle.wheelInfos.length; i++) {
      this.vehicle.updateWheelTransform(i);
    }

    // 🔥 ВИЗУАЛИЗАЦИЯ ЛУЧЕЙ
    this.vehicle.wheelInfos.forEach((wheelInfo, i) => {
      const start = wheelInfo.chassisConnectionPointWorld;
      const direction = wheelInfo.directionWorld;

      const length = wheelInfo.suspensionRestLength + wheelInfo.radius;

      const end = new THREE.Vector3(
        start.x + direction.x * length,
        start.y + direction.y * length,
        start.z + direction.z * length
      );

      const positions =
        this.suspensionLines[i].geometry.attributes.position.array;

      positions[0] = start.x;
      positions[1] = start.y;
      positions[2] = start.z;

      positions[3] = end.x;
      positions[4] = end.y;
      positions[5] = end.z;

      this.suspensionLines[i].geometry.attributes.position.needsUpdate = true;
    });
  }

  _createWheelMesh(radius = WHEEL_RADIUS) {
    const geometry = new THREE.CylinderGeometry(
      radius,
      radius,
      WHEEL_RADIUS,
      16
    );
    const material = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const wheel = new THREE.Mesh(geometry, material);

    // цилиндр по умолчанию стоит вертикально — кладём его
    wheel.rotation.x = Math.PI / 2;
    wheel.castShadow = true;
    return wheel;
  }
}
