import * as THREE from "three";

export class Lights {
  constructor(app) {
    this.scene = app.scene;
    this.debug = app.debug;

    this.ambientLight = new THREE.AmbientLight();
    this.scene.add(this.ambientLight);

    this.directionalLight = new THREE.DirectionalLight("#ffffff", 5);
    this.directionalLight.position.set(3, 4, 3);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.mapSize.set(1024, 1024);
    this.directionalLight.shadow.camera.near = 0.1;
    this.directionalLight.shadow.camera.far = 20;
    this.directionalLight.shadow.camera.left = -10;
    this.directionalLight.shadow.camera.right = 10;
    this.directionalLight.shadow.camera.top = 10;
    this.directionalLight.shadow.camera.bottom = -10;
    this.scene.add(this.directionalLight);

    this.directionalLightHelper = new THREE.DirectionalLightHelper(
      this.directionalLight,
      1,
    );
    this.scene.add(this.directionalLightHelper);

    this.setDebug();
  }

  setDebug() {
    if (!this.debug?.gui) return;

    const folder = this.debug.gui.addFolder("Lights");
    folder.open(false); // close

    folder
      .add(this.ambientLight, "intensity", 0, 3, 0.01)
      .name("ambient.intensity");

    folder
      .add(this.directionalLight, "intensity", 0, 5, 0.01)
      .name("directional.intensity");
    folder
      .add(this.directionalLight.position, "x", -20, 20, 0.1)
      .name("directional.x")
      .onChange(() => this.directionalLightHelper.update());
    folder
      .add(this.directionalLight.position, "y", -20, 20, 0.1)
      .name("directional.y")
      .onChange(() => this.directionalLightHelper.update());
    folder
      .add(this.directionalLight.position, "z", -20, 20, 0.1)
      .name("directional.z")
      .onChange(() => this.directionalLightHelper.update());
  }
}
