import * as THREE from "three";
import * as CANNON from "cannon-es";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * Car — физическая машина на базе cannon-es RaycastVehicle
 *
 * Архитектура:
 * - 1 физический корпус (chassisBody)
 * - RaycastVehicle считает подвеску и колёса (через лучи)
 * - Колёса НЕ являются физическими телами машины
 * - Визуальные колёса синхронизируются из wheelInfos.worldTransform
 */

const WHEEL_RADIUS = 0.45;

export default class Car {
  constructor(scene) {
    this.scene = scene;
    this.loader = new GLTFLoader();
    /* =========================
     * PHYSICS: chassis (корпус)
     * ========================= */
    const chassisShape = new CANNON.Box(new CANNON.Vec3(3, 0.5, 1));
    const chassisBody = new CANNON.Body({ mass: 75 });
    chassisBody.addShape(chassisShape);
    chassisBody.position.set(0, 3, 0);
    chassisBody.angularVelocity.set(0, -0.5, 0);

    /* =========================
     * RENDER: chassis mesh
     * ========================= */
    const chassisGeometry = new THREE.BoxGeometry(4, 1, 2);
    const chassisMaterial = new THREE.MeshStandardMaterial({ visible: false });
    const chassisMesh = new THREE.Mesh(chassisGeometry, chassisMaterial);
    chassisMesh.castShadow = true;
    scene.add(chassisMesh);

    this.body = chassisBody;
    this.mesh = chassisMesh;

    // === GLTF car model loading ===
    this.carModel = null;
    this.wheelsGLTF = {
      frontLeft: null,
      frontRight: null,
      rearLeft: null,
      rearRight: null,
    };

    this.loader.load("/static/car/nissan/Nissan_Silvia_S13.gltf", (gltf) => {
      const model = gltf.scene;

      model.traverse((obj) => {
        if (!obj.isObject3D) return;

        const name = obj.name.toLowerCase();

        console.log(obj);

        if (name.includes("front") && name.includes("left")) {
          this.wheelsGLTF.frontLeft = obj;
        }

        if (name.includes("front") && name.includes("right")) {
          this.wheelsGLTF.frontRight = obj;
        }

        if (name === "rear_left_wheel") {
          this.wheelsGLTF.rearLeft = obj;
        }

        if (name === "rear_right_wheel") {
          this.wheelsGLTF.rearRight = obj;
        }
      });

      Object.values(this.wheelsGLTF).forEach((wheel) => {
        if (!wheel) return;

        wheel.traverse((obj) => {
          if (obj.isMesh) {
            obj.material = obj.material.clone();
            // obj.material.emissive.setHex(0x00ff00);
            obj.material.emissiveIntensity = 0.5;
          }
        });
      });

      model.traverse((obj) => {
        if (obj.isMesh) {
          obj.castShadow = true;
          obj.receiveShadow = true;
        }
      });

      // временно ставим модель в позицию корпуса
      model.position.copy(this.mesh.position);
      model.quaternion.copy(this.mesh.quaternion);

      // 1️⃣ Масштаб — ты уже сделал
      model.scale.set(3, 3, 3);

      // 2️⃣ ВАЖНО: у GLTF и Cannon могут отличаться «вперёд»/оси.
      // Мы НЕ крутим model.rotation напрямую, потому что в update() мы копируем quaternion из physics.
      // Вместо этого храним оффсет и всегда домножаем его в update().
      this.modelVisualOffset = new THREE.Quaternion();
      this.modelVisualOffset.setFromEuler(new THREE.Euler(0, Math.PI / 2, 0));

      this.scene.add(model);
      this.carModel = model;

      // === Вариант A: выносим колёса из иерархии carModel прямо в сцену ===
      // Теперь им можно безопасно задавать world position/quaternion из physics.
      const detachToScene = (obj) => {
        if (!obj) return;
        // attach сохранит world-transform при перепривязке
        this.scene.attach(obj);
      };

      detachToScene(this.wheelsGLTF.frontLeft);
      detachToScene(this.wheelsGLTF.frontRight);
      detachToScene(this.wheelsGLTF.rearLeft);
      detachToScene(this.wheelsGLTF.rearRight);
    });

    this.wheelVisualCorrection = new THREE.Quaternion();
    this.wheelVisualCorrection.setFromEuler(
      new THREE.Euler(0, 0, -Math.PI / 2)
    );

    this.wheelTestRotation = new THREE.Quaternion();
    this.wheelTestRotation.setFromEuler(
      new THREE.Euler(0, Math.PI / 2, 0) // 90° вокруг Y
    );

    /* =========================
     * RAYCAST VEHICLE
     * ========================= */
    const vehicle = new CANNON.RaycastVehicle({ chassisBody });

    // === Handling: base grip (важная ручка дрифта) ===
    // Больше = больше держак, меньше = легче сорвать.
    const FRONT_FRICTION = 1.6; // перед должен держать (контроль)
    const REAR_FRICTION = 0.4; // зад должен срываться раньше (дрифт)

    // === Handling: roll influence (распределение крена) ===
    // Меньше = стабильнее, больше = активнее в заносе
    const FRONT_ROLL = 0.01;
    const REAR_ROLL = 0.005;

    const wheelOptions = {
      radius: WHEEL_RADIUS,
      directionLocal: new CANNON.Vec3(0, -1, 0),
      suspensionStiffness: 30,
      suspensionRestLength: 0.1,
      frictionSlip: 2,
      dampingRelaxation: 2.3,
      dampingCompression: 4.4,
      maxSuspensionForce: 100000,
      rollInfluence: 0.03,
      axleLocal: new CANNON.Vec3(0, 0, 1),
      chassisConnectionPointLocal: new CANNON.Vec3(),
      maxSuspensionTravel: 0.3,
      customSlidingRotationalSpeed: -30,
      useCustomSlidingRotationalSpeed: true,
    };

    /* =========================
     * WHEELS: logical positions
     * ========================= */
    const wheelPositions = [
      new THREE.Vector3(-1.7, -0.3, 1),
      new THREE.Vector3(1.6, -0.3, 1),
      new THREE.Vector3(-1.7, -0.3, -1),
      new THREE.Vector3(1.6, -0.3, -1),
    ];

    wheelPositions.forEach((v) => {
      wheelOptions.chassisConnectionPointLocal.set(v.x, v.y, v.z);
      vehicle.addWheel(wheelOptions);
    });

    this.vehicle = vehicle;

    // === Apply front / rear grip + roll split ===
    // 0,1 — передние колёса
    // 2,3 — задние колёса
    this.vehicle.wheelInfos.forEach((wheel, index) => {
      const isFront = index === 0 || index === 2;

      wheel.frictionSlip = isFront ? FRONT_FRICTION : REAR_FRICTION;
      wheel.rollInfluence = isFront ? FRONT_ROLL : REAR_ROLL;
    });

    /* =========================
     * WHEELS: kinematic bodies + meshes (demo style)
     * ========================= */
    this.wheelBodies = [];
    this.wheelMeshes = [];

    const wheelMaterial = new CANNON.Material("wheel");

    this.vehicle.wheelInfos.forEach((wheel) => {
      // physics proxy
      const shape = new CANNON.Cylinder(
        wheel.radius,
        wheel.radius,
        wheel.radius / 2,
        16
      );

      const body = new CANNON.Body({ mass: 0, material: wheelMaterial });
      body.type = CANNON.Body.KINEMATIC;
      body.collisionFilterGroup = 0;

      const q = new CANNON.Quaternion();
      q.setFromEuler(Math.PI / 2, 0, 0);
      body.addShape(shape, new CANNON.Vec3(), q);

      this.wheelBodies.push(body);

      // visual
      const geometry = new THREE.CylinderGeometry(
        wheel.radius,
        wheel.radius,
        wheel.radius / 2,
        16
      );
      const material = new THREE.MeshStandardMaterial({ visible: false });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;

      scene.add(mesh);
      this.wheelMeshes.push(mesh);
    });
  }

  /**
   * Steering control.
   * Управляет углом поворота колёс через RaycastVehicle.
   */
  setSteering(value) {
    // front wheels
    this.vehicle.setSteeringValue(value, 0); // front-left
    this.vehicle.setSteeringValue(value, 2); // front-right
  }

  /**
   * Engine force.
   * Прикладывает крутящий момент к ведущим колёсам.
   */
  setEngineForce(force) {
    // rear wheels (RWD)
    this.vehicle.applyEngineForce(force, 1); // rear-left
    this.vehicle.applyEngineForce(force, 3); // rear-right
  }

  /**
   * Update loop.
   * Синхронизация physics → render и применение управления.
   */
  update() {
    // перед синхронизацией корпуса
    this.mesh.position.copy(this.body.position);
    this.mesh.quaternion.copy(this.body.quaternion);

    // // синхронизация GLTF-модели с физическим корпусом
    if (this.carModel) {
      this.carModel.position.copy(this.body.position);
      // ⬇️ ВАЖНО: визуальный оффсет вниз
      this.carModel.position.y -= 0.7;
      this.carModel.quaternion.copy(this.body.quaternion);
      if (this.modelVisualOffset)
        this.carModel.quaternion.multiply(this.modelVisualOffset);
    }

    for (let i = 0; i < this.vehicle.wheelInfos.length; i++) {
      this.vehicle.updateWheelTransform(i);

      const t = this.vehicle.wheelInfos[i].worldTransform;

    const gltfWheelsByIndex = [
      this.wheelsGLTF.frontLeft, // 0
      this.wheelsGLTF.rearLeft, // 1
      this.wheelsGLTF.frontRight, // 2
      this.wheelsGLTF.rearRight, // 3
    ];
      
      // // 2) синхронизируем GLTF (если колесо есть)
      // if (gltfWheel) {
      //   gltfWheel.position.copy(t.position);

      //   const finalQuat = new THREE.Quaternion();
      //   finalQuat.copy(t.quaternion);
      //   finalQuat.multiply(this.wheelVisualCorrection);
      //   finalQuat.multiply(this.wheelTestRotation); // ← ПОВОРОТ НА 90°

      //   gltfWheel.quaternion.copy(finalQuat);
      // }

      const gltfWheel = gltfWheelsByIndex[i];

      if (gltfWheel) {
        gltfWheel.position.copy(t.position);

        const finalQuat = new THREE.Quaternion();
        finalQuat.copy(t.quaternion);
        finalQuat.multiply(this.wheelVisualCorrection);
        finalQuat.multiply(this.wheelTestRotation); // ← ПОВОРОТ НА 90°

        gltfWheel.quaternion.copy(finalQuat);
      }

      // 3) (опционально) оставляем твои цилиндры как debug
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

      const correction = new THREE.Quaternion();
      correction.setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0));
      wheelQuat.multiply(correction);
      wheelMesh.quaternion.copy(wheelQuat);
    }
  }
}
