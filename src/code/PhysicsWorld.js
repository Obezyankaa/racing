// src/core/PhysicsWorld.js
import * as CANNON from "cannon-es";

export class PhysicsWorld {
  constructor() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.82, 0);

    // Для оптимизации
    this.world.broadphase = new CANNON.NaiveBroadphase();
    this.world.solver.iterations = 10;

    // Храним пары физика-визуал
    this.bodies = [];
  }

  addBody(body, mesh) {
    this.world.addBody(body);
    this.bodies.push({ body, mesh });
  }

  update(deltaTime) {
    this.world.step(1 / 60, deltaTime, 3);

    // Синхронизируем визуал с физикой
    this.bodies.forEach(({ body, mesh }) => {
      mesh.position.copy(body.position);
      mesh.quaternion.copy(body.quaternion);
    });
  }

  removeBody(body) {
    this.world.removeBody(body);
    this.bodies = this.bodies.filter((b) => b.body !== body);
  }
}
