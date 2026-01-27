// src/utils/debug/LightingDebug.js

export class LightingDebug {
  constructor(gui, game) {
    this.gui = gui;
    this.game = game;
    this.params = {};

    this.init();
    this.setTime(0.5); // ← устанавливаем полдень по умолчанию
  }

  init() {
    const lightingFolder = this.gui.addFolder("☀️ Lighting");

    // Параметры для контроля
    this.params.timeOfDay = this.game.lightingSystem.timeOfDay;
    this.params.autoUpdate = this.game.lightingSystem.autoUpdate;
    this.params.cycleSpeed = this.game.lightingSystem.cycleSpeed;

    // Слайдер времени суток
    lightingFolder
      .add(this.params, "timeOfDay", 0, 1, 0.01)
      .name("Time of Day")
      .onChange((value) => {
        this.game.lightingSystem.setTimeOfDay(value);
      })
      .listen(); // автообновление когда цикл работает

    // Чекбокс включения цикла
    lightingFolder
      .add(this.params, "autoUpdate")
      .name("Auto Cycle")
      .onChange((value) => {
        this.game.lightingSystem.autoUpdate = value;
      });

    // Слайдер скорости цикла
    lightingFolder
      .add(this.params, "cycleSpeed", 0.001, 0.1, 0.001)
      .name("Cycle Speed")
      .onChange((value) => {
        this.game.lightingSystem.cycleSpeed = value;
      });
    
    // Быстрые кнопки
    const presets = {
      "Midnight (00:00)": () => this.setTime(0),
      "Dawn (06:00)": () => this.setTime(0.25),
      "Noon (12:00)": () => this.setTime(0.5),
      "Sunset (18:00)": () => this.setTime(0.75),
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
    // Когда нажимаем кнопку - выключаем автоцикл
    this.game.lightingSystem.autoUpdate = false;
    this.params.autoUpdate = false;
  }
}
