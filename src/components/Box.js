import * as THREE from "three";

export default class Box {
  constructor(scene) {
    this.scene = scene;
    // 1. Create canvas
    const canvas = document.createElement("canvas");
    canvas.width = 512; // you can adjust size
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    // background
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // text style
    ctx.font = "48px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Car 🏎💨", canvas.width / 2, canvas.height / 2);

    // 2. Create texture from canvas
    const textTexture = new THREE.CanvasTexture(canvas);
    // optional: might need these for crispness
    textTexture.minFilter = THREE.LinearFilter;
    textTexture.generateMipmaps = false;

    // 3. Build material array so you can assign different materials per face
    const materials = [
      new THREE.MeshNormalMaterial(), // +X
      new THREE.MeshNormalMaterial(), // –X
      new THREE.MeshNormalMaterial(), // +Y
      new THREE.MeshNormalMaterial(), // –Y
      new THREE.MeshBasicMaterial({ map: textTexture }), // +Z face (front)
      new THREE.MeshNormalMaterial(), // –Z
    ];

    this.geometry = new THREE.BoxGeometry(4, 1, 2);
    this.cube = new THREE.Mesh(this.geometry, materials);
    this.cube.position.set(2, 1, 0); // x=2, y=1, z=-5
    this.cube.castShadow = true;
    this.cube.receiveShadow = false;

    document.addEventListener("keydown", (event) => {

      const step = 1;

      if (event.code === "KeyW") {
        this.cube.position.x += step;
      }

      switch (event.code) {
        case "KeyW":
          this.cube.position.x += step;
          break;
        case "KeyS":
          this.cube.position.x -= step;
          break;
        case "KeyA":
          this.cube.position.z += step;
          break;
        case "KeyD":
          this.cube.position.z -= step;
          break;

        default:
          break;
      }
    });

    scene.add(this.cube);
  }
}
