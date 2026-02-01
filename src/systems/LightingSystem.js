// src/systems/LightingSystem.js
import * as THREE from "three";

export class LightingSystem {
  constructor(scene) {
    this.scene = scene;
    this.lights = {};
    this.timeOfDay = 0; // 0 = полночь, 0.5 = полдень, 1 = полночь (полный цикл)
    this.autoUpdate = false; // включен ли автоматический цикл
    this.cycleSpeed = 0.01; // скорость цикла (0.01 = ~100 секунд на полный день)

    this.init();
  }


  init() {
    // Ambient light - рассеянный свет
    this.lights.ambient = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(this.lights.ambient);

    // Directional light (солнце)
    this.lights.sun = new THREE.DirectionalLight(0xffffff, 0.8);
    this.lights.sun.position.set(10, 10, 5);
    this.lights.sun.castShadow = true;

    // Настройки теней
    this.lights.sun.shadow.mapSize.width = 2048;
    this.lights.sun.shadow.mapSize.height = 2048;
    this.lights.sun.shadow.camera.near = 0.5;
    this.lights.sun.shadow.camera.far = 50;
    this.lights.sun.shadow.camera.left = -20;
    this.lights.sun.shadow.camera.right = 20;
    this.lights.sun.shadow.camera.top = 20;
    this.lights.sun.shadow.camera.bottom = -20;

    this.scene.add(this.lights.sun);
  }

  // Устанавливаем время вручную (0 = полночь, 0.5 = полдень, 1 = полночь)
  setTimeOfDay(time) {
    this.timeOfDay = Math.max(0, Math.min(1, time)); // ограничиваем 0-1
    this.updateSunPosition();
  }

  // Обновляем позицию солнца на основе timeOfDay
  updateSunPosition() {
    // Преобразуем timeOfDay (0-1) в угол (0-360 градусов)
    // Добавляем -Math.PI/2 чтобы 0 = полночь (солнце внизу)
    const angle = this.timeOfDay * Math.PI * 2 - Math.PI / 2;

    // Высота солнца: от -1 (под землёй) до +1 (зенит)
    const sunHeight = Math.sin(angle);

    // Устанавливаем позицию солнца
    const distance = 30; // расстояние от центра
    this.lights.sun.position.set(
      Math.cos(angle) * distance, // X: движение по кругу
      sunHeight * distance, // Y: высота
      Math.sin(angle) * distance, // Z: движение по кругу
    );

    // Обновляем интенсивность и цвет света
    this.updateLightIntensity(sunHeight);
    this.updateLightColor(sunHeight);

    // console.log(
    //   `Время: ${this.timeOfDay.toFixed(2)}, Высота: ${sunHeight.toFixed(2)}`,
    // );
  }

  // Меняем яркость в зависимости от высоты солнца
  updateLightIntensity(sunHeight) {
    // Если солнце под землёй (ночь) - делаем 0, иначе берём высоту
    const dayIntensity = Math.max(0, sunHeight);

    // Солнце: от 0 (ночь) до 1.0 (полдень)
    this.lights.sun.intensity = dayIntensity * 1.0;

    // Ambient: ночью 0.4 (чтобы видеть), днём 0.6
    this.lights.ambient.intensity = 0.4 + dayIntensity * 0.2;
  }

  // Меняем цвет света в зависимости от высоты солнца
  updateLightColor(sunHeight) {
    // Закат/рассвет: когда солнце около горизонта (-0.1 до 0.1)
    if (sunHeight > -0.1 && sunHeight < 0.1) {
      this.lights.sun.color.setHex(0xffa500); // оранжевый
    }
    // День: солнце высоко
    else if (sunHeight > 0) {
      this.lights.sun.color.setHex(0xffffff); // белый
    }
    // Ночь: солнце под землёй
    else {
      this.lights.sun.color.setHex(0x6495ed); // синеватый
    }
  }

  // Вызывается каждый кадр из Game.js
  update(deltaTime) {
    if (!this.autoUpdate) return; // если выключен - ничего не делаем


    // Двигаем время вперёд
    this.timeOfDay += this.cycleSpeed * deltaTime;

    // Если прошли полный круг - начинаем заново
    if (this.timeOfDay >= 1.0) {
      this.timeOfDay = 0;
    }

    // Обновляем солнце
    this.updateSunPosition();
  }

  dispose() {
    Object.values(this.lights).forEach((light) => {
      this.scene.remove(light);
      light.dispose();
    });
  }
}
