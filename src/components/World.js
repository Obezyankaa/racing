import * as THREE from "three";
import * as CANNON from "cannon-es";
import Light from "./Light.js";
import Box from "./Box.js";
import Floor from "./Floor.js";

export default class World {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;

    // ✅ Добавляем свет
    this.plane = new Floor(this.scene);
    this.lights = new Light(this.scene);
    this.box = new Box(this.scene);

    if (this.lights && this.lights.spotLight) {
      this.lights.spotLight.target = this.plane.plane; // цель — сам пол
      this.scene.add(this.lights.spotLight.target);
    }

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
    this.lights?.update();
    this.box.animation(delta);
    this.world.step(delta);
  }
}
