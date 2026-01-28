// src/utils/debug/InputDebug.js

export class InputDebug {
  constructor(pane, game) {
    this.pane = pane;
    this.game = game;
    this.params = {};

    this.init();
  }

  init() {
    const inputFolder = this.pane.addFolder({
      expanded: false,
      title: "🎮 Input",
    });

    // Показываем состояние всех кнопок
    this.game.inputController.bindings.forEach((binding) => {
      this.params[binding.name] = false;

      inputFolder.addBinding(this.params, binding.name, {
        readonly: true,
        label: `${binding.name} (${binding.keys.join(", ")})`,
      });
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
  }
}
