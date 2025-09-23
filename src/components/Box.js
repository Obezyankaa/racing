import * as THREE from "three";

export default class Box {
  constructor(scene) {
    this.scene = scene;

    this.geometry = new THREE.BoxGeometry(1, 1, 1);
    this.material = new THREE.MeshNormalMaterial();
    this.cube = new THREE.Mesh(this.geometry, this.material);
    this.cube.castShadow = true; //default is false
    this.cube.receiveShadow = false; //default
    scene.add(this.cube);
  }

  animation(time) {
     this.cube.rotation.x = time / 2000;
     this.cube.rotation.y = time / 1000;
  }
}
