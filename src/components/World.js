import * as THREE from "three";
import * as CANNON from "cannon-es";
import CannonDebugger from "cannon-es-debugger";

import DebugGUI from "../utils/DebugGUI.js";

import Light from "./Light.js";
import Floor from "./Floor.js";
import LampPost from "./LampPost.js";
import ConcreteBlock from "./ConcreteBlock.js";
import Car from "./car/Car.js";
import CarControls from "./car/CarControls.js";


export default class World {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.debugUI = new DebugGUI();
    this.axesHelper = new THREE.AxesHelper(5);
    this.cameraMode = "FREE"; // FREE | FOLLOW

    // ✅ Добавляем свет
    this.plane = new Floor(this.scene);
    this.lights = new Light(this.scene, { debugUI: this.debugUI });
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
    // this._addLampPosts();
    // Беттоные блоки добавляем
    // this._addConcreteBlock();

    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.82, 0), // m/s²
    });
    this.fixedTimeStep = 1 / 60;
    this.maxSubSteps = 3;

    this.cannonDebugger = CannonDebugger(this.scene, this.world, {
      color: 0x00ff00, // цвет линий
    });

    // const asphaltMaterial = new CANNON.Material("asphalt");
    // const ballMaterial = new CANNON.Material("ball");
    // const asphaltBallContact = new CANNON.ContactMaterial(
    //   asphaltMaterial,
    // ballMaterial,
    //   {
    //     friction: 0.6,
    //     restitution: 0.5,
    //   }
    // );
    // this.world.addContactMaterial(asphaltBallContact);

    const groundShape = new CANNON.Box(
      new CANNON.Vec3(15, 0.1, 15) // половины размеров
    );

    const groundBody = new CANNON.Body({
      type: CANNON.Body.STATIC,
      shape: groundShape,
      // material: asphaltMaterial,
    });

    groundBody.position.set(0, -0.1, 0);
    this.world.addBody(groundBody);
    // groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); // make it face up
    // this.world.addBody(groundBody);

    // ✅ Добавляем машину
    this.car = new Car(this.scene);
    this.world.addBody(this.car.body);
    this.followCameraOffset = new THREE.Vector3(6, 3, 0);
    this.car.vehicle.addToWorld(this.world);
    this.controls = new CarControls(this.car);

    // добавляем колёса (demo style)
    this.car.wheelBodies.forEach((wheelBody) => {
      this.world.addBody(wheelBody);
    });

    window.addEventListener("keydown", (e) => {
      if (e.code === "KeyC") {
        this.cameraMode = this.cameraMode === "FREE" ? "FOLLOW" : "FREE";
      }
    });
  }

  
  update(delta) {
    this.lights?.update();
    this.lampPosts?.forEach((lamp) => lamp.update());
    this.world.step(this.fixedTimeStep, delta, this.maxSubSteps);
    this.controls.update();
    this.car.update();

    // =========================
    // CAMERA UPDATE
    // =========================
    if (this.cameraMode === "FOLLOW") {
      const carPosition = this.car.mesh.position.clone();
      const carQuaternion = this.car.mesh.quaternion.clone();

      // смещаем камеру назад относительно машины
      const offset = this.followCameraOffset.clone();
      offset.applyQuaternion(carQuaternion);

      const cameraPosition = carPosition.clone().add(offset);

      this.camera.position.lerp(cameraPosition, 0.1);
      this.camera.lookAt(carPosition);
    }
    this.cannonDebugger.update();
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
