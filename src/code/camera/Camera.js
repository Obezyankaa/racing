import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export class MyCamera {
  constructor(app) {
    this.scene = app.scene;
    this.sizes = app.sizes;
    this.canvas = app.canvas;
    this.debug = app.debug;

    this.instance = new THREE.PerspectiveCamera(
      75,
      this.sizes.width / this.sizes.height,
      0.1,
      100
    );
    this.instance.position.set(1, 1, 2);
    this.scene.add(this.instance);

    this.controls = new OrbitControls(this.instance, this.canvas);
    this.controls.enableDamping = true;

    this.setDebug();
  }

  setDebug() {
    if (!this.debug?.gui) return;

    const folder = this.debug.gui.addFolder("Camera");
    folder.open(false); // close

    folder.add(this.instance.position, "x", -20, 20, 0.1).name("position.x");
    folder.add(this.instance.position, "y", -20, 20, 0.1).name("position.y");
    folder.add(this.instance.position, "z", -20, 20, 0.1).name("position.z");
  }

  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height;
    this.instance.updateProjectionMatrix();
  }

  update() {
    this.controls.update();
  }
}
