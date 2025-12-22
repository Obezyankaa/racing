import * as THREE from "three";
// import * as CANNON from "cannon-es";
import Light from "./Light.js";
import Box from "./Box.js";
import Floor from "./Floor.js";
import LampPost from "./LampPost.js";
import ConcreteBlock from "./ConcreteBlock.js";
import DebugGUI from "../utils/DebugGUI.js";

export default class World {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.debugUI = new DebugGUI();
    this.axesHelper = new THREE.AxesHelper(5);

    // ✅ Добавляем свет
    this.plane = new Floor(this.scene);
    this.lights = new Light(this.scene, { debugUI: this.debugUI });
    // this.box = new Box(this.scene);
    /**
     * Туман
     */
    // scene.fog = new THREE.FogExp2("#606d71ff", 0.1);

    if (this.lights && this.lights.spotLight) {
      this.lights.spotLight.target = this.plane.plane; // цель — сам пол
      this.scene.add(this.lights.spotLight.target);
    }
    if (this.axesHelper) {
      this.scene.add(this.axesHelper);
    }

    // Ламповые столбы по углам пола
    this._addLampPosts();
    // Беттоные блоки добавляем
    this._addConcreteBlock();

    // this.world = new CANNON.World({
    //   gravity: new CANNON.Vec3(0, -9.82, 0), // m/s²
    // });

    // const radius = 1; // m
    // const sphereBody = new CANNON.Body({
    //   mass: 5, // kg
    //   shape: new CANNON.Sphere(radius),
    // });
    // sphereBody.position.set(0, 10, 0); // m
    // this.world.addBody(sphereBody);
  }

  update(delta) {
    this.lights?.update();
    this.lampPosts?.forEach((lamp) => lamp.update());
    // this.world.step(delta);
  }

  _addConcreteBlock() {
    if (!this.plane?.plane?.geometry) return;

    const center = new THREE.Vector3();
    this.plane.plane.getWorldPosition(center);

    const { width, height } = this.plane.plane.geometry.parameters;
    const halfW = width / 2;
    const halfH = height / 2;

    const blockScale = 1;
    const blockLength = 2 * blockScale;
    const blockSpacing = blockLength;
    const edgeOffset = 0;

    this.concreteBlocks = [];

    const addBlock = (localPos, rotationY) => {
      const worldPos = this.plane.plane.localToWorld(localPos.clone());

      if (edgeOffset !== 0) {
        const offsetDir = worldPos.clone().sub(center).normalize();
        worldPos.addScaledVector(offsetDir, edgeOffset);
      }

      const block = new ConcreteBlock(this.scene, {
        position: worldPos,
        rotation: new THREE.Euler(0, rotationY, 0),
        scale: blockScale,
        usePlaceholder: false,
        debugUI: this.debugUI,
      });

      this.concreteBlocks.push(block);
    };

    for (let x = -halfW; x <= halfW; x += blockSpacing) {
      addBlock(new THREE.Vector3(x, -halfH, 0), Math.PI / 2);
      addBlock(new THREE.Vector3(x, halfH, 0), Math.PI / 2);
    }

    for (
      let y = -halfH + blockSpacing;
      y <= halfH - blockSpacing;
      y += blockSpacing
    ) {
      addBlock(new THREE.Vector3(-halfW, y, 0), 0);
      addBlock(new THREE.Vector3(halfW, y, 0), 0);
    }
  }

  _addLampPosts() {
    if (!this.plane?.plane?.geometry) return;

    const center = new THREE.Vector3();
    this.plane.plane.getWorldPosition(center);

    const { width, height } = this.plane.plane.geometry.parameters;
    const halfW = width / 2;
    const halfH = height / 2;

    const localCorners = [
      new THREE.Vector3(-halfW, -halfH, 0),
      new THREE.Vector3(halfW, -halfH, 0),
      new THREE.Vector3(halfW, halfH, 0),
      new THREE.Vector3(-halfW, halfH, 0),
    ];

    const worldCorners = localCorners.map((v) =>
      this.plane.plane.localToWorld(v.clone())
    );

    this.lampPosts = [];

    worldCorners.forEach((pos) => {
      const lamp = new LampPost(this.scene, {
        position: pos,
        usePlaceholder: false,
        debugUI: this.debugUI,
      });

      lamp.group.lookAt(center);
      this.lampPosts.push(lamp);
    });
  }
}
