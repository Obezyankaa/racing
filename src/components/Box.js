import * as THREE from "three";
export default class Box {
  constructor(scene, position = new THREE.Vector3(0, 2, 0)) {
    // this.color = new THREE.Color().setRGB(0.5, 0.5, 0.5);
    this.boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    this.boxMaterial = new THREE.MeshStandardMaterial();
    this.mesh = new THREE.Mesh(this.boxGeometry, this.boxMaterial);
     this.mesh.position.copy(position);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = false;

    scene.add(this.mesh);
  }
}
