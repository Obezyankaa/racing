import * as THREE from "three";

export class Cube {
  constructor(app) {
    this.scene = app.scene;

    this.geometry = new THREE.BoxGeometry(1, 1, 1);
    this.material = new THREE.MeshStandardMaterial({ color: "#e35f5f" });

    this.instance = new THREE.Mesh(this.geometry, this.material);
    this.instance.position.y = 0.5;
    this.instance.castShadow = true;

    this.scene.add(this.instance);
  }
}
