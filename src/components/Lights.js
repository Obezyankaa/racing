import * as THREE from "three";
import GUI from "../utils/GUI";

const obj = {
  turnOnHelper: false,
};

export default class Lights {
  constructor(scene) {
    // 💡 Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // 💡 Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;

    directionalLight.shadow.mapSize.width = 512;
    directionalLight.shadow.mapSize.height = 512;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 20;

    scene.add(directionalLight);

    // 👁️ CameraHelper
    const helper = new THREE.CameraHelper(directionalLight.shadow.camera);
    helper.visible = obj.turnOnHelper; 
    scene.add(helper);

    // GUI
    const folder = GUI.addFolder("Свет");
    folder
      .add(obj, "turnOnHelper")
      .name("Хелпер тени")
      .onChange((value) => {
        helper.visible = value;
      });
    
    // folder.add(directionalLight, "intensity", 0, 2).name("Интенсивность");
    // folder
    //   .addColor({ color: "#ffffff" }, "color")
    //   .name("Цвет света")
    //   .onChange((value) => directionalLight.color.set(value));


    // Сохраняем ссылки
    this.ambientLight = ambientLight;
    this.directionalLight = directionalLight;
    this.helper = helper;
  }
}
