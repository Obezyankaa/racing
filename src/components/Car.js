import * as THREE from "three";
import * as CANNON from "cannon-es";
// ⚠️ Реализация колёс как в cannon-es demo (kinematic wheel bodies)

const WHEEL_RADIUS = 0.45;

export default class Car {
  constructor(scene) {
    const chassisShape = new CANNON.Box(new CANNON.Vec3(2, 0.5, 1));
    const chassisBody = new CANNON.Body({ mass: 150 });
    chassisBody.addShape(chassisShape);
    chassisBody.position.set(0, 3, 0);
    chassisBody.angularVelocity.set(0, -0.5, 0);

    const geometry = new THREE.BoxGeometry(4, 1, 2);
    const material = new THREE.MeshStandardMaterial({
      color: 0xff3333,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    scene.add(mesh);

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
      suspensionRestLength: 0.1,
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
      rollInfluence: 0.03,
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

    this.vehicle = vehicle;

    // ===== Wheel bodies (как в demo) =====
    this.wheelBodies = [];
    this.wheelMeshes = [];

    const wheelMaterial = new CANNON.Material("wheel");

    this.vehicle.wheelInfos.forEach((wheel) => {
      const cylinderShape = new CANNON.Cylinder(
        wheel.radius,
        wheel.radius,
        wheel.radius / 2,
        16
      );
      const wheelBody = new CANNON.Body({
        mass: 0,
        material: wheelMaterial,
      });

      wheelBody.type = CANNON.Body.KINEMATIC;
      wheelBody.collisionFilterGroup = 0;

      const q = new CANNON.Quaternion();
      q.setFromEuler(Math.PI / 2, 0, 0);

      wheelBody.addShape(cylinderShape, new CANNON.Vec3(), q);

      this.wheelBodies.push(wheelBody);

      const geometry = new THREE.CylinderGeometry(
        wheel.radius,
        wheel.radius,
        wheel.radius / 2,
        16
      );

      const material = new THREE.MeshStandardMaterial({ color: 0x222222 });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;

      scene.add(mesh);
      this.wheelMeshes.push(mesh);
    });

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

    this.controls = {
      forward: false,
      backward: false,
      left: false,
      right: false,
    };

    window.addEventListener("keydown", (e) => {
      switch (e.code) {
        case "KeyW":
          this.controls.forward = true;
          break;
        case "KeyS":
          this.controls.backward = true;
          break;
        case "KeyA":
          this.controls.left = true;
          break;
        case "KeyD":
          this.controls.right = true;
          break;
      }
    });

    window.addEventListener("keyup", (e) => {
      switch (e.code) {
        case "KeyW":
          this.controls.forward = false;
          break;
        case "KeyS":
          this.controls.backward = false;
          break;
        case "KeyA":
          this.controls.left = false;
          break;
        case "KeyD":
          this.controls.right = false;
          break;
      }
    });
  }

  setSteering(value) {
    // value в радианах: ~0.3 = нормальный поворот
    this.vehicle.setSteeringValue(value, 0); // front-left
    this.vehicle.setSteeringValue(value, 2); // front-right
  }

  setEngineForce(force) {
    this.vehicle.applyEngineForce(force, 1); // rear-left
    this.vehicle.applyEngineForce(force, 3); // rear-right
  }

  update() {
    // синхронизация корпуса
    this.mesh.position.copy(this.body.position);
    this.mesh.quaternion.copy(this.body.quaternion);

    // ===== sync wheel bodies from RaycastVehicle (demo style) =====
    for (let i = 0; i < this.vehicle.wheelInfos.length; i++) {
      this.vehicle.updateWheelTransform(i);
      const t = this.vehicle.wheelInfos[i].worldTransform;
      const wheelBody = this.wheelBodies[i];

      wheelBody.position.copy(t.position);
      wheelBody.quaternion.copy(t.quaternion);
      const wheelMesh = this.wheelMeshes[i];
      wheelMesh.position.copy(wheelBody.position);
      const wheelQuat = new THREE.Quaternion(
        wheelBody.quaternion.x,
        wheelBody.quaternion.y,
        wheelBody.quaternion.z,
        wheelBody.quaternion.w
      );

      // фиксируем ориентацию цилиндра (ось X)
      const correction = new THREE.Quaternion();
      correction.setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0));

      wheelQuat.multiply(correction);
      wheelMesh.quaternion.copy(wheelQuat);
    }

    const ENGINE_FORCE = 200;

    if (this.controls.forward) {
      this.setEngineForce(-ENGINE_FORCE);
    } else if (this.controls.backward) {
      this.setEngineForce(ENGINE_FORCE);
    } else {
      this.setEngineForce(0);
    }

    const STEER_VALUE = 0.3;

    if (this.controls.left) {
      this.setSteering(STEER_VALUE);
    } else if (this.controls.right) {
      this.setSteering(-STEER_VALUE);
    } else {
      this.setSteering(0);
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
}
