import * as THREE from "three";
import * as CANNON from "cannon-es";

export default class Box {
  constructor(scene, position = new THREE.Vector3(0, 2, 0), world) {
    this.scene = scene;
    this.world = world;

    // 📦 THREE.Mesh
    this.boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    this.boxMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    this.mesh = new THREE.Mesh(this.boxGeometry, this.boxMaterial);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.position.copy(position);
    scene.add(this.mesh);

    // 🎯 CANNON.Body
    const cubeShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
    this.body = new CANNON.Body({ mass: 1 });
    this.body.addShape(cubeShape);
    this.body.position.set(position.x, position.y, position.z);
    world.addBody(this.body);
  }

  update() {
    // 🔄 Синхронизация позиции и поворота
    this.mesh.position.set(
      this.body.position.x,
      this.body.position.y,
      this.body.position.z
    );
    this.mesh.quaternion.set(
      this.body.quaternion.x,
      this.body.quaternion.y,
      this.body.quaternion.z,
      this.body.quaternion.w
    );
  }
}
