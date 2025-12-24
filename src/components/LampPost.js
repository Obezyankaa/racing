import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

let lampPostCount = 0;

export default class LampPost {
  constructor(scene, options = {}) {
    this.scene = scene;

    const {
      position = new THREE.Vector3(0, 0, 0),
      rotation = new THREE.Euler(0, 0, 0),
      scale = 1,
      usePlaceholder = true,
      modelUrl = "/static/model/lamppost/scene.gltf",
      onLoad = null,
      onError = null,
      debugUI = null,
      debugLabel = null,
    } = options;

    this.debugUI = debugUI;
    lampPostCount += 1;
    this.debugLabel = debugLabel || `LampPost ${lampPostCount}`;

    this.group = new THREE.Group();
    this.group.position.copy(position);
    this.group.rotation.copy(rotation);
    this.group.scale.setScalar(scale);

    if (usePlaceholder) {
      this._addPlaceholder();
    }

    this.scene.add(this.group);

    if (modelUrl) {
      this._loadModel(modelUrl, onLoad, onError);
    }
  }

  _addPlaceholder() {
    // Simple placeholder mesh so you can see the post before the real model.
    const poleGeometry = new THREE.CylinderGeometry(0.1, 0.12, 3, 12);
    const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.y = 1.5;
    pole.castShadow = true;

    const headGeometry = new THREE.BoxGeometry(0.5, 0.3, 0.5);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xddddaa });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 3, 0);
    head.castShadow = true;

    this.group.add(pole, head);
  }

  setModel(model) {
    // Clear placeholders, then mount a real model (e.g., glTF scene).
    this.group.clear();
    this.group.add(model);
  }

  setPosition(x, y, z) {
    this.group.position.set(x, y, z);
  }

  _loadModel(modelUrl, dracoDecoderPath, onLoad, onError) {
    const loader = new GLTFLoader();

    loader.load(
      modelUrl,
      (gltf) => {
        this.group.clear();
        gltf.scene.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        gltf.scene.rotation.y = -Math.PI / 2; // пример
        this.group.add(gltf.scene);
        this._addLight();
        if (typeof onLoad === "function") onLoad(gltf);
      },
      undefined,
      (err) => {
        if (typeof onError === "function") onError(err);
        console.error("LampPost model load error:", err);
      }
    );
  }

  _addLight() {
    const light = new THREE.SpotLight(
      0xffeecc, // color
      50, // intensity
      12, // distance
      Math.PI / 5, // angle
      0.6, // penumbra
      1 // decay
    );

    // позиция лампы (где лампочка)
    light.position.set(-0.08, 5.35, 1);
    // цель — куда светит
    const target = new THREE.Object3D();
    target.position.set(0, -80, 30);

    this.group.add(light);
    this.group.add(target);

    light.target = target;

    light.castShadow = true;
    light.visible = false;

    this.spotLight = light;
    this.lightHelper = new THREE.SpotLightHelper(light);
     this.lightHelper.visible = this.spotLight.visible;
    this.scene.add(this.lightHelper);

    this._setupLightGui();
  }

  _setupLightGui() {
    if (!this.debugUI || !this.spotLight) return;

    const folder = this.debugUI.addFolder(`${this.debugLabel} Light`);
    const params = {
      color: this.spotLight.color.getHex(),
      intensity: this.spotLight.intensity,
      distance: this.spotLight.distance,
      angle: this.spotLight.angle,
      penumbra: this.spotLight.penumbra,
      decay: this.spotLight.decay,
      focus: this.spotLight.shadow.focus,
      position: {
        positionX: this.spotLight.position.x,
        positionY: this.spotLight.position.y,
        positionZ: this.spotLight.position.z,
      },
      enabled: this.spotLight.visible,
    };

      folder.add(params, "enabled").onChange((value) => {
        this.spotLight.visible = value;
        this.lightHelper.visible = value;
      });

    folder.addColor(params, "color").onChange((value) => {
      this.spotLight.color.setHex(value);
    });

    folder.add(params, "intensity", 0, 50).onChange((value) => {
      this.spotLight.intensity = value;
    });

    folder.add(params, "distance", 0, 50).onChange((val) => {
      this.spotLight.distance = val;
    });

    folder.add(params, "angle", 0, Math.PI / 2).onChange((val) => {
      this.spotLight.angle = val;
    });

    folder.add(params, "penumbra", 0, 1).onChange((val) => {
      this.spotLight.penumbra = val;
    });

    folder.add(params, "decay", 1, 2).onChange((val) => {
      this.spotLight.decay = val;
    });

    folder.add(params, "focus", 0, 1).onChange((val) => {
      this.spotLight.shadow.focus = val;
    });

    folder.add(params.position, "positionX", -10, 10).onChange((val) => {
      this.spotLight.position.x = val;
    });

    folder.add(params.position, "positionY", -10, 10).onChange((val) => {
      this.spotLight.position.y = val;
    });

    folder.add(params.position, "positionZ", -10, 10).onChange((val) => {
      this.spotLight.position.z = val;
    });
    
    folder.close();
  }

  update() {
    this.lightHelper?.update();
  }
}
