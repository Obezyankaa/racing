import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const DEFAULT_MODEL_URL = "/static/model/concrete-block/scene.gltf";
const modelCache = new Map();

const getModelEntry = (modelUrl) => {
  const url = modelUrl || DEFAULT_MODEL_URL;
  let entry = modelCache.get(url);
  if (entry) return entry;

  const loader = new GLTFLoader();
  entry = {
    url,
    promise: null,
    gltf: null,
    scene: null,
    yOffset: 0,
  };

  entry.promise = new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        gltf.scene.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        gltf.scene.updateMatrixWorld(true);
        const bounds = new THREE.Box3().setFromObject(gltf.scene);

        entry.gltf = gltf;
        entry.scene = gltf.scene;
        entry.yOffset = -bounds.min.y;

        resolve(entry);
      },
      undefined,
      (err) => {
        modelCache.delete(url);
        reject(err);
      }
    );
  });

  modelCache.set(url, entry);
  return entry;
};

let concreteBlockCount = 0;

export default class ConcreteBlock {
  constructor(scene, options = {}) {
    this.scene = scene;

    const {
      position = new THREE.Vector3(0, 0, 0),
      rotation = new THREE.Euler(0, 0, 0),
      scale = 1,
      usePlaceholder = true,
      modelUrl = DEFAULT_MODEL_URL,
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

  static preload(modelUrl = DEFAULT_MODEL_URL) {
    return getModelEntry(modelUrl).promise;
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
    const entry = getModelEntry(modelUrl);

    entry.promise
      .then((cached) => {
        const model = cached.scene.clone(true);

        if (this.alignToGround && cached.yOffset !== 0) {
          model.position.y += cached.yOffset;
        }

        this.group.clear();
        this.group.add(model);

        if (typeof onLoad === "function") {
          const payload = cached.gltf
            ? { ...cached.gltf, scene: model }
            : { scene: model };
          onLoad(payload);
        }
      })
      .catch((err) => {
        if (typeof onError === "function") onError(err);
        console.error("ConcreteBlock model load error:", err);
      });
  }

  setPosition(x, y, z) {
    this.group.position.set(x, y, z);
  }

  setRotation(x, y, z) {
    this.group.rotation.set(x, y, z);
  }
}
