// src/utils/debug/LightingDebug.js

export class LightingDebug {
  constructor(gui, game) {
    this.gui = gui;
    this.game = game;
    this.params = {};

    this.init();
  }

  init() {
    const lightingFolder = this.gui.addFolder("☀️ Lighting");

    // Параметры для контроля
    this.params.timeOfDay = this.game.lightingSystem.timeOfDay;
    this.params.dayNightCycle = this.game.lightingSystem.dayNightCycle;
    this.params.useRealTime = this.game.lightingSystem.useRealTime;

    // Слайдер времени суток
    lightingFolder
      .add(this.params, "timeOfDay", 0, 1, 0.01)
      .name("Time of Day")
      .onChange((value) => {
        this.game.lightingSystem.setTimeOfDay(value);
      })
      .listen(); // автообновление значения

    // Включить/выключить цикл
    lightingFolder
      .add(this.params, "dayNightCycle")
      .name("Day/Night Cycle")
      .onChange((value) => {
        this.game.lightingSystem.dayNightCycle = value;
      });

    // Реальное время
    lightingFolder
      .add(this.params, "useRealTime")
      .name("Use Real Time")
      .onChange((value) => {
        this.game.lightingSystem.useRealTime = value;
      });

    // Быстрые кнопки
    const presets = {
      "Midnight (00:00)": () => this.setTime(0),
      "Dawn (06:00)": () => this.setTime(0.05),
      "Noon (12:00)": () => this.setTime(0.25),
      "Sunset (18:00)": () => this.setTime(0.45),
      "Sync Real Time": () => this.game.lightingSystem.syncWithRealTime(),
    };

    const presetsFolder = lightingFolder.addFolder("⏰ Quick Presets");

    Object.entries(presets).forEach(([name, fn]) => {
      presetsFolder.add({ action: fn }, "action").name(name);
    });

    presetsFolder.open();
    lightingFolder.open();
  }

  setTime(value) {
    this.params.timeOfDay = value;
    this.game.lightingSystem.setTimeOfDay(value);
    this.game.lightingSystem.dayNightCycle = false;
    this.params.dayNightCycle = false;
  }
}
