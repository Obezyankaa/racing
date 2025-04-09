// components/Lights.js
import * as THREE from "three";
import GUI from "../utils/GUI";

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
    const folder = GUI.addFolder("Свет");
      
    
    // 👁️ Камера-хелпер (опционально)
    const helper = new THREE.CameraHelper(directionalLight.shadow.camera);
    scene.add(helper);

    // сохраняем, если нужно потом менять из GUI
    this.ambientLight = ambientLight;
    this.directionalLight = directionalLight;
    this.helper = helper;
  }
}
