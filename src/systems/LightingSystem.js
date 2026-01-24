// src/systems/LightingSystem.js
import * as THREE from "three";

export class LightingSystem {
  constructor(scene) {
    this.scene = scene;
    this.lights = {};
    this.timeOfDay = 0.5; // 0 = полночь, 0.5 = полдень, 1 = полночь
    this.dayNightCycle = false;
    this.useRealTime = false;

    // Оптимизация: обновляем освещение не каждый кадр
    this.updateInterval = 1.0; // обновлять раз в секунду
    this.timeSinceLastUpdate = 0;

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

  // Установить время на основе реального времени пользователя
  syncWithRealTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // Преобразуем текущее время в значение 0-1
    // 0:00 = 0, 12:00 = 0.5, 24:00 = 1
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    this.timeOfDay = totalSeconds / 86400; // 86400 секунд в сутках

    this.useRealTime = true;
    this.updateLighting();

    console.log(`🕐 Синхронизировано с реальным временем: ${hours}:${minutes}`);
  }

  // Включить/выключить цикл день/ночь
  enableDayNightCycle(enabled, useRealTime = false) {
    this.dayNightCycle = enabled;

    if (enabled && useRealTime) {
      this.syncWithRealTime();
    }
  }

  update(deltaTime) {
    if (!this.dayNightCycle) return;

    // ОПТИМИЗАЦИЯ: обновляем освещение не каждый кадр, а раз в секунду
    this.timeSinceLastUpdate += deltaTime;

    if (this.timeSinceLastUpdate < this.updateInterval) {
      return; // пропускаем обновление
    }

    this.timeSinceLastUpdate = 0;

    if (this.useRealTime) {
      // Реальное время: 1 секунда в игре = 1 секунда в жизни
      this.timeOfDay += this.updateInterval / 86400;
    } else {
      // Ускоренное время: полный цикл за 60 секунд (для демо/тестов)
      this.timeOfDay += this.updateInterval * 0.016;
    }

    if (this.timeOfDay > 1) this.timeOfDay = 0;

    this.updateLighting();
  }

  updateLighting() {
    // Рассчитываем угол солнца
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

  // Вручную установить время суток (0-1)
  setTimeOfDay(time) {
    this.timeOfDay = Math.max(0, Math.min(1, time));
    this.updateLighting();
  }

  // Получить текущее время в формате HH:MM
  getCurrentTime() {
    const totalSeconds = this.timeOfDay * 86400;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  }

  dispose() {
    Object.values(this.lights).forEach((light) => {
      this.scene.remove(light);
      light.dispose();
    });
  }
}
