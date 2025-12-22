import * as THREE from "three";
import * as CANNON from "cannon-es";
import Light from "./Light.js";
import Box from "./Box.js";
import Floor from "./Floor.js";
import LampPost from "./LampPost.js";

export default class World {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;

    // ✅ Добавляем свет
    this.plane = new Floor(this.scene);
    this.lights = new Light(this.scene);
    // this.box = new Box(this.scene);
    /**
     * Туман
     */
    // scene.fog = new THREE.FogExp2("#606d71ff", 0.1);
    
    if (this.lights && this.lights.spotLight) {
      this.lights.spotLight.target = this.plane.plane; // цель — сам пол
      this.scene.add(this.lights.spotLight.target);
    }

    // Ламповые столбы по углам пола
    this._addLampPosts();

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
    this.lampPosts?.forEach((lamp) => lamp.update());
    this.world.step(delta);
  }

  _addLampPosts() {
    if (!this.plane?.plane?.geometry) return;

    const center = new THREE.Vector3();
    this.plane.plane.getWorldPosition(center);


    const { width, height } = this.plane.plane.geometry.parameters;
    const halfW = width / 2;
    const halfH = height / 2;

    const localCorners = [
      new THREE.Vector3(-halfW, -halfH, 0),
      new THREE.Vector3(halfW, -halfH, 0),
      new THREE.Vector3(halfW, halfH, 0),
      new THREE.Vector3(-halfW, halfH, 0),
    ];

    const worldCorners = localCorners.map((v) =>
      this.plane.plane.localToWorld(v.clone())
    );

  worldCorners.forEach((pos) => {
    const lamp = new LampPost(this.scene, {
      position: pos,
      usePlaceholder: false,
    });

    lamp.group.lookAt(center);
  });
  }
}
