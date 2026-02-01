// src/core/PhysicsWorld.js
import RAPIER from "@dimforge/rapier3d-compat";

export class PhysicsWorld {
  constructor() {
    this.world = null;
    this.bodies = []; // пары { rigidBody, mesh }
    this.initialized = false;
  }

  async init() {
    // Rapier нужно инициализировать асинхронно
    await RAPIER.init();

    // Создаём мир физики
    const gravity = { x: 0.0, y: -9.81, z: 0.0 };
    this.world = new RAPIER.World(gravity);

    this.initialized = true;
    // console.log("✅ Rapier physics initialized");

    return RAPIER; // возвращаем RAPIER для использования в Game.js
  }

  addBody(rigidBody, mesh) {
    this.bodies.push({ rigidBody, mesh });
  }

  update(deltaTime) {
    if (!this.initialized) return;

    // Обновляем мир физики
    this.world.step();

    // Синхронизируем визуал с физикой
    this.bodies.forEach(({ rigidBody, mesh }) => {
      const position = rigidBody.translation();
      const rotation = rigidBody.rotation();

      mesh.position.set(position.x, position.y, position.z);
      mesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
    });
  }

  removeBody(rigidBody) {
    this.world.removeRigidBody(rigidBody);
    this.bodies = this.bodies.filter((b) => b.rigidBody !== rigidBody);
  }

  getWorld() {
    return this.world;
  }
}
