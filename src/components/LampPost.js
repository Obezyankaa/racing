import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";


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
    } = options;

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
      0xffeecc, // тёплый цвет
      10, // интенсивность
      15, // дистанция
      Math.PI / 5, // угол
      0.4, // penumbra
      1 // decay
    );

    // позиция лампы (где лампочка)
    light.position.set(5, 3, 0);

    // цель — куда светит
    const target = new THREE.Object3D();
    target.position.set(0, 0, 0);

    this.group.add(light);
    this.group.add(target);

    light.target = target;

    light.castShadow = true;

    this.lightHelper = new THREE.SpotLightHelper(light);
    this.scene.add(this.lightHelper);
  }

  update() {
    this.lightHelper?.update();
  }
}

