import * as THREE from "three";
export default class Light {
  constructor(scene) {
    this.scene = scene;

    this.light = new THREE.AmbientLight(0x404040); // soft white light
    scene.add(this.light);

    // White directional light at half intensity shining from the top.
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    this.directionalLight.position.set(5, 10, 5);
    scene.add(this.directionalLight);

    this.helperDirectionalLight = new THREE.DirectionalLightHelper(
      this.directionalLight,
      5
    );
    scene.add(this.helperDirectionalLight);
  }
}
