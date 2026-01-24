// src/systems/LightingSystem.js
import * as THREE from "three";

export class LightingSystem {
  constructor(scene) {
    this.scene = scene;
    this.lights = {};
    this.timeOfDay = 0.5; // 0 = ночь, 0.5 = день, 1 = ночь
    this.dayNightCycle = false;

    this.init();
  }

  init() {
    // Ambient light
    this.lights.ambient = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(this.lights.ambient);

    // Directional light (солнце)
    this.lights.directional = new THREE.DirectionalLight(0xffffff, 0.8);
    this.lights.directional.position.set(10, 10, 5);
    this.lights.directional.castShadow = true;

    // Настройки теней
    this.lights.directional.shadow.mapSize.width = 2048;
    this.lights.directional.shadow.mapSize.height = 2048;
    this.lights.directional.shadow.camera.near = 0.5;
    this.lights.directional.shadow.camera.far = 50;
    this.lights.directional.shadow.camera.left = -20;
    this.lights.directional.shadow.camera.right = 20;
    this.lights.directional.shadow.camera.top = 20;
    this.lights.directional.shadow.camera.bottom = -20;

    this.scene.add(this.lights.directional);
  }

  // Включить/выключить цикл день/ночь
  enableDayNightCycle(enabled) {
    this.dayNightCycle = enabled;
  }

  update(deltaTime) {
    if (!this.dayNightCycle) return;

    // Медленный цикл день/ночь (полный цикл за ~60 секунд)
    this.timeOfDay += deltaTime * 0.016;
    if (this.timeOfDay > 1) this.timeOfDay = 0;

    this.updateLighting();
  }

  updateLighting() {
    // Рассчитываем угол солнца (0 = восход, 0.5 = зенит, 1 = закат)
    const angle = this.timeOfDay * Math.PI * 2;
    const sunHeight = Math.sin(angle);

    // Позиция солнца
    this.lights.directional.position.set(
      Math.cos(angle) * 10,
      sunHeight * 10,
      Math.sin(angle) * 10,
    );

    // Интенсивность в зависимости от времени суток
    const dayIntensity = Math.max(0, sunHeight);
    this.lights.directional.intensity = dayIntensity * 0.8;
    this.lights.ambient.intensity = 0.3 + dayIntensity * 0.2;

    // Цвет в зависимости от времени суток
    if (sunHeight < 0.1 && sunHeight > -0.1) {
      // Закат/рассвет - оранжевый
      this.lights.directional.color.setHex(0xff7f50);
    } else if (sunHeight > 0) {
      // День - белый
      this.lights.directional.color.setHex(0xffffff);
    } else {
      // Ночь - синеватый
      this.lights.directional.color.setHex(0x4169e1);
    }
  }

  setTimeOfDay(time) {
    this.timeOfDay = Math.max(0, Math.min(1, time));
    this.updateLighting();
  }

  dispose() {
    Object.values(this.lights).forEach((light) => {
      this.scene.remove(light);
      light.dispose();
    });
  }
}
