// App.js
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import World from "./components/World.js";

export default class App {
  constructor(canvas) {
    this.canvas = canvas;

    this.scene = new THREE.Scene();
    this.sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    this.camera = new THREE.PerspectiveCamera(
      75,
      this.sizes.width / this.sizes.height,
      0.1,
      100
    );
    this.camera.position.set(-6, 5, 5);
    this.scene.add(this.camera);

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;

    this.world = new World(this.scene, this.camera);

    this.setResizeHandler();
    this.clock = new THREE.Clock();
    this.tick();
  }

  setResizeHandler() {
    window.addEventListener("resize", () => {
      this.sizes.width = window.innerWidth;
      this.sizes.height = window.innerHeight;

      this.camera.aspect = this.sizes.width / this.sizes.height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(this.sizes.width, this.sizes.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }

  tick() {
    const delta = Math.min(this.clock.getDelta(), 0.1);

    this.controls.update();
    this.world.update(delta);
    this.renderer.render(this.scene, this.camera);

    window.requestAnimationFrame(this.tick.bind(this));
  }
}
