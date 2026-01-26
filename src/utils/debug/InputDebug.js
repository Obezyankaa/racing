// src/utils/debug/InputDebug.js

export class InputDebug {
  constructor(gui, game) {
    this.gui = gui;
    this.game = game;
    this.params = {};

    this.init();
  }

  init() {
    const inputFolder = this.gui.addFolder("🎮 Input");

    // Показываем состояние всех кнопок
    this.game.inputController.bindings.forEach((binding) => {
      this.params[binding.name] = false;

      inputFolder
        .add(this.params, binding.name)
        .name(`${binding.name} (${binding.keys.join(", ")})`)
        .disable()
        .listen();
    });

    // Обновляем состояния в реальном времени
    const update = () => {
      this.game.inputController.bindings.forEach((binding) => {
        this.params[binding.name] = this.game.inputController.isPressed(
          binding.name,
        );
      });
      requestAnimationFrame(update);
    };

    update();

    inputFolder.open();
  }
}
