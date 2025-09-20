import * as THREE from "three";
import * as CANNON from "cannon-es";
import Light from "./Light.js";
import Box from "./Box.js";

export default class World {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;

    // ✅ Добавляем свет
      this.lights = new Light(this.scene);
      this.box = new Box(this.scene);

    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.82, 0), // m/s²
    });

    const radius = 1; // m
    const sphereBody = new CANNON.Body({
      mass: 5, // kg
      shape: new CANNON.Sphere(radius),
    });
    sphereBody.position.set(0, 10, 0); // m
    this.world.addBody(sphereBody);
  }

  update(delta) {
    this.world.step(delta);
  }
}
