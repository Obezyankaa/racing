// src/utils/debug/LightingDebug.js

export class LightingDebug {
  constructor(pane, game) {
    this.pane = pane;
    this.game = game;
    this.params = {};

    this.init();
    this.setTime(0.5); // ← устанавливаем полдень по умолчанию
  }

  init() {
    const lightingFolder = this.pane.addFolder({ expanded: false, title: "☀️ Lighting" });

    lightingFolder

    // Параметры для контроля
    this.params.timeOfDay = this.game.lightingSystem.timeOfDay;
    this.params.autoUpdate = this.game.lightingSystem.autoUpdate;
    this.params.cycleSpeed = this.game.lightingSystem.cycleSpeed;

    // Слайдер времени суток
    lightingFolder
      .addBinding(this.params, "timeOfDay", {
        min: 0,
        max: 1,
        step: 0.01,
        label: "Time of Day",
      })
      .on("change", (ev) => {
        this.game.lightingSystem.setTimeOfDay(ev.value);
      });

    // Чекбокс включения цикла
    lightingFolder
      .addBinding(this.params, "autoUpdate", {
        label: "Auto Cycle",
      })
      .on("change", (ev) => {
        this.game.lightingSystem.autoUpdate = ev.value;
      });

    // Слайдер скорости цикла
    lightingFolder
      .addBinding(this.params, "cycleSpeed", {
        min: 0.001,
        max: 0.1,
        step: 0.001,
        label: "Cycle Speed",
      })
      .on("change", (ev) => {
        this.game.lightingSystem.cycleSpeed = ev.value;
      });

    // Быстрые кнопки
    const presetsFolder = lightingFolder.addFolder({ title: "⏰ Quick Presets" });

    presetsFolder.addButton({ title: "Midnight (00:00)" }).on("click", () => {
      this.setTime(0);
    });
    presetsFolder.addButton({ title: "Dawn (06:00)" }).on("click", () => {
      this.setTime(0.25);
    });
    presetsFolder.addButton({ title: "Noon (12:00)" }).on("click", () => {
      this.setTime(0.5);
    });
    presetsFolder.addButton({ title: "Sunset (18:00)" }).on("click", () => {
      this.setTime(0.75);
    });
  }

  setTime(value) {
    this.params.timeOfDay = value;
    this.game.lightingSystem.setTimeOfDay(value);
    // Когда нажимаем кнопку - выключаем автоцикл
    this.game.lightingSystem.autoUpdate = false;
    this.params.autoUpdate = false;
  }
}
