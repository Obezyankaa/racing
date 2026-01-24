// src/utils/debug/PhysicsDebug.js

export class PhysicsDebug {
  constructor(gui, game) {
    this.gui = gui;
    this.game = game;
    this.params = {};

    this.init();
  }

  init() {
    const physicsFolder = this.gui.addFolder("⚛️ Physics");

    this.params.gravity = -9.82;

    physicsFolder
      .add(this.params, "gravity", -20, 0, 0.1)
      .name("Gravity")
      .onChange((value) => {
        this.game.physics.world.gravity.y = value;
      });

    // Кнопка сброса куба
    physicsFolder
      .add(
        {
          reset: () => {
            // Найдём куб и сбросим его позицию
            const cube = this.game.physics.bodies.find(
              (b) => b.body.mass === 1,
            );
            if (cube) {
              cube.body.position.set(0, 5, 0);
              cube.body.velocity.set(0, 0, 0);
              cube.body.angularVelocity.set(0, 0, 0);
            }
          },
        },
        "reset",
      )
      .name("Reset Cube");

    physicsFolder.open();
  }
}
