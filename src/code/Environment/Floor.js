import * as THREE from "three";

export class Floor {
  constructor(app) {
    this.scene = app.scene;

    this.geometry = new THREE.PlaneGeometry(10, 10);
    this.material = new THREE.MeshStandardMaterial({ color: "#444444" });

    this.instance = new THREE.Mesh(this.geometry, this.material);
    this.instance.rotation.x = -Math.PI * 0.5;
    this.instance.receiveShadow = true;

    this.scene.add(this.instance);
  }
}
