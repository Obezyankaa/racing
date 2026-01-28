// src/utils/debug/PhysicsDebug.js

export class PhysicsDebug {
  constructor(pane, game) {
    this.pane = pane;
    this.game = game;
    this.params = {};

    this.init();
  }

  init() {
    const physicsFolder = this.pane.addFolder({
      expanded: false,
      title: "⚛️ Physics",
    });

    this.params.gravity = -9.81;

    physicsFolder
      .addBinding(this.params, "gravity", {
        min: -20,
        max: 0,
        step: 0.1,
        label: "Gravity",
      })
      .on("change", (ev) => {
        this.game.physics.world.gravity.y = ev.value;
      });

    // Кнопка сброса машины
    physicsFolder.addButton({ title: "Reset Vehicle" }).on("click", () => {
      if (this.game.vehicle) {
        this.game.vehicle.reset();
      }
    });
  }
}
