import * as THREE from "three";
import GUI from "lil-gui";

// const obj = {
//   myBoolean: false,
//   position: {
//     x: 5,
//     y: 10,
//     z: 5,
//   },
// };

export default class Light {
  constructor(scene) {
    this.scene = scene;
    this.gui = new GUI();

    // основной свет (SpotLight)
    this.spotLight = new THREE.SpotLight(0xffffff, 100);
    this.spotLight.position.set(2.5, 5, 2.5);
    this.spotLight.angle = Math.PI / 6;
    this.spotLight.penumbra = 1;
    this.spotLight.decay = 2;
    this.spotLight.distance = 10;
    // this.spotLight.map = textures["disturb.jpg"];

    this.spotLight.castShadow = true;
    this.spotLight.shadow.mapSize.width = 1024;
    this.spotLight.shadow.mapSize.height = 1024;
    this.spotLight.shadow.camera.near = 1;
    this.spotLight.shadow.camera.far = 10;
    this.spotLight.shadow.focus = 1;
    scene.add(this.spotLight);

    this.lightHelper = new THREE.SpotLightHelper(this.spotLight);
    scene.add(this.lightHelper);

    const params = {
      color: this.spotLight.color.getHex(),
      intensity: this.spotLight.intensity,
      distance: this.spotLight.distance,
      angle: this.spotLight.angle,
      penumbra: this.spotLight.penumbra,
      decay: this.spotLight.decay,
      focus: this.spotLight.shadow.focus,
      shadows: true,
      position: {
        positionX: 0,
        positionY: 0,
        positionZ: 0,
      },
    };

    const folder = this.gui.addFolder("SpotLight");

    folder.addColor(params, "color").onChange((value) => {
      this.spotLight.color.setHex(value);
    });

    folder.add(params, "intensity", 0, 500).onChange((value) => {
      console.log(value);
      this.spotLight.intensity = value;
    });

    folder.add(params, "distance", 0, 20).onChange((val) => {
      this.spotLight.distance = val;
    });

    folder.add(params, "angle", 0, Math.PI / 3).onChange((val) => {
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
      this.spotLight.position.x = val
    });

      folder.add(params.position, "positionY", -10, 10).onChange((val) => {
        this.spotLight.position.y = val;
      });
    
      folder.add(params.position, "positionZ", -10, 10).onChange((val) => {
        this.spotLight.position.z = val;
      });



    folder.open();

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.2));
  }

  update() {
    // пример анимации
    const t = performance.now() / 3000;
    this.spotLight.position.x = Math.cos(t) * 2.5;
    this.spotLight.position.z = Math.sin(t) * 2.5;

    // // helper должен обновляться каждый кадр, если что-то двигается
    this.lightHelper.update();
  }
}
