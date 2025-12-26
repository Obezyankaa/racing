import * as THREE from "three";
import * as CANNON from "cannon-es";

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
    /* =========================
     * PHYSICS: chassis (корпус)
     * ========================= */
    const chassisShape = new CANNON.Box(new CANNON.Vec3(2, 0.5, 1));
    const chassisBody = new CANNON.Body({ mass: 150 });
    chassisBody.addShape(chassisShape);
    chassisBody.position.set(0, 3, 0);
    chassisBody.angularVelocity.set(0, -0.5, 0);

    /* =========================
     * RENDER: chassis mesh
     * ========================= */
    const chassisGeometry = new THREE.BoxGeometry(4, 1, 2);
    const chassisMaterial = new THREE.MeshStandardMaterial({ color: 0xff3333 });
    const chassisMesh = new THREE.Mesh(chassisGeometry, chassisMaterial);
    chassisMesh.castShadow = true;
    scene.add(chassisMesh);

    this.body = chassisBody;
    this.mesh = chassisMesh;

    /* =========================
     * RAYCAST VEHICLE
     * ========================= */
    const vehicle = new CANNON.RaycastVehicle({ chassisBody });

    const wheelOptions = {
      radius: WHEEL_RADIUS,
      directionLocal: new CANNON.Vec3(0, -1, 0),
      suspensionStiffness: 30,
      suspensionRestLength: 0.1,
      frictionSlip: 1.4,
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
      new THREE.Vector3(-1, -0.3,  1),
      new THREE.Vector3( 1, -0.3,  1),
      new THREE.Vector3(-1, -0.3, -1),
      new THREE.Vector3( 1, -0.3, -1),
    ];

    wheelPositions.forEach((v) => {
      wheelOptions.chassisConnectionPointLocal.set(v.x, v.y, v.z);
      vehicle.addWheel(wheelOptions);
    });

    this.vehicle = vehicle;

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
      const material = new THREE.MeshStandardMaterial({ color: 0x222222 });
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

    // перед синхронизацией колёс
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
  }
}
