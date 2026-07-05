import * as THREE from "three";
import { Sizes } from "./utils/Sizes.js";
import { MyCamera } from "./camera/Camera.js";
import { Renderer } from "./Renderer.js";
import { Floor } from "./Environment/Floor.js";
import { Cube } from "./Environment/Cube.js";
import { Debug } from "./utils/Debug.js";
import { Lights } from "./light/Lights.js";

export class App {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.sizes = new Sizes();
    this.debug = new Debug();

    this.camera = new MyCamera(this);
    this.lights = new Lights(this);
    this.floor = new Floor(this);
    this.cube = new Cube(this);
    this.renderer = new Renderer(this);

    this.sizes.addEventListener("resize", () => this.resize());

    this.tick();
  }

  resize() {
    this.camera.resize();
    this.renderer.resize();
  }

  tick() {
    this.camera.update();
    this.renderer.update();

    window.requestAnimationFrame(() => this.tick());
  }
}
