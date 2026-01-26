// src/utils/debug/LightingDebug.js

export class LightingDebug {
  constructor(gui, game) {
    this.gui = gui;
    this.game = game;
    this.params = {};
    
    this.init();
    console.log(this.game.lightingSystem.setTimeOfDay());
  }
  init() {
    const lightingFolder = this.gui.addFolder('☀️ Lighting');

    // Параметры для контроля
    this.params.timeOfDay = this.game.lightingSystem.timeOfDay;

    // Слайдер времени суток
    lightingFolder
      .add(this.params, 'timeOfDay', 0, 1, 0.01)
      .name('Time of Day')
      .onChange((value) => {
        this.game.lightingSystem.setTimeOfDay(value);
      });

    // Быстрые кнопки
    const presets = {
      'Midnight (00:00)': () => this.setTime(0),
      'Dawn (06:00)': () => this.setTime(0.25),
      'Noon (12:00)': () => this.setTime(0.5),
      'Sunset (18:00)': () => this.setTime(0.75)
    };

    const presetsFolder = lightingFolder.addFolder('⏰ Quick Presets');

    Object.entries(presets).forEach(([name, fn]) => {
      presetsFolder.add({ action: fn }, 'action').name(name);
    });

    presetsFolder.open();
    lightingFolder.open();
  }

  setTime(value) {
    this.params.timeOfDay = value;
    this.game.lightingSystem.setTimeOfDay(value);
  }
}