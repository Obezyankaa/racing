import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

let concreteBlockCount = 0;

export default class ConcreteBlock {
  constructor(scene, options = {}) {
    this.scene = scene;

    const {
      position = new THREE.Vector3(0, 0, 0),
      rotation = new THREE.Euler(0, 0, 0),
      scale = 1,
      usePlaceholder = true,
      modelUrl = "/static/model/concrete-block/scene.gltf",
      onLoad = null,
      onError = null,
      debugUI = null,
      debugLabel = null,
      alignToGround = true,
    } = options;

    this.debugUI = debugUI;
    concreteBlockCount += 1;
    this.debugLabel = debugLabel || `ConcreteBlock ${concreteBlockCount}`;
    this.alignToGround = alignToGround;

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
    const geometry = new THREE.BoxGeometry(0.3, 0.6, 2);
    const material = new THREE.MeshStandardMaterial({ color: 0x8d8d8d });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = 0.3;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.group.add(mesh);
  }

  _loadModel(modelUrl, onLoad, onError) {
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

        if (this.alignToGround) {
          const bounds = new THREE.Box3().setFromObject(gltf.scene);
          const minY = bounds.min.y;
          if (minY !== 0) {
            gltf.scene.position.y -= minY;
          }
        }

        this.group.add(gltf.scene);
        if (typeof onLoad === "function") onLoad(gltf);
      },
      undefined,
      (err) => {
        if (typeof onError === "function") onError(err);
        console.error("ConcreteBlock model load error:", err);
      }
    );
  }

  setPosition(x, y, z) {
    this.group.position.set(x, y, z);
  }

  setRotation(x, y, z) {
    this.group.rotation.set(x, y, z);
  }
}
