import * as THREE from "three";

export default class Asphalt {
  constructor(scene) {
    const textureLoader = new THREE.TextureLoader();

    const diffuse = textureLoader.load(
      "./asphalt/aerial_asphalt_01_diff_1k.jpg"
    );
    const normal = textureLoader.load(
      "./asphalt/aerial_asphalt_01_nor_gl_1k.jpg"
    );
    const roughness = textureLoader.load(
      "./asphalt/aerial_asphalt_01_arm_1k.jpg"
    );

    const anisotropyLevel = 8;
    [diffuse, normal, roughness].forEach((tex) => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(4, 4);
      tex.anisotropy = anisotropyLevel;
    });
    diffuse.colorSpace = THREE.SRGBColorSpace; 

    this.planeGeometry = new THREE.PlaneGeometry(20, 20, 32, 32);
    this.planeMaterial = new THREE.MeshStandardMaterial({
      map: diffuse,
      normalMap: normal,
      roughnessMap: roughness,
      side: THREE.DoubleSide,
    });
    this.planeMesh = new THREE.Mesh(this.planeGeometry, this.planeMaterial);
    this.planeMesh.rotateX(-Math.PI / 2);
    this.planeMesh.receiveShadow = true;

    scene.add(this.planeMesh);
  }
}
