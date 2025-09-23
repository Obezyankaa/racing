import * as THREE from "three";

export default class Floor {
  constructor(scene) {
    this.scene = scene;

    this.geometry = new THREE.PlaneGeometry(10, 10);
    this.material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
    });
    this.plane = new THREE.Mesh(this.geometry, this.material);
    this.plane.rotation.x = -Math.PI * 0.5;
    this.plane.position.y = -0.5;
    this.plane.receiveShadow = true;
    scene.add(this.plane);
  }
}
