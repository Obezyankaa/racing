// src/utils/Debug.js
import { GUI } from "lil-gui";
import { LightingDebug } from "./debug/LightingDebug.js";
import { PhysicsDebug } from "./debug/PhysicsDebug.js";
import { CameraDebug } from "./debug/CameraDebug.js";

export class Debug {
  constructor(game) {
    this.game = game;
    this.gui = new GUI({ title: "🎮 Debug Panel" });

    this.init();
  }

  init() {
    // Инициализируем отдельные debug модули
    new LightingDebug(this.gui, this.game);
      new PhysicsDebug(this.gui, this.game);
       new CameraDebug(this.gui, this.game);

    // Можно добавить общую информацию
    this.addGeneralInfo();
  }

  addGeneralInfo() {
    const infoFolder = this.gui.addFolder("ℹ️ Info");

    const info = {
      fps: "0",
      renderer: this.game.renderer.info.render.triangles,
    };

    // FPS счётчик
    let lastTime = performance.now();
    let frames = 0;

    const fpsController = infoFolder.add(info, "fps").name("FPS").disable();

    const updateFPS = () => {
      frames++;
      const currentTime = performance.now();

      if (currentTime >= lastTime + 1000) {
        info.fps = frames.toString();
        frames = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(updateFPS);
    };

    updateFPS();

    infoFolder.open();
  }

  // Показать/скрыть панель
  toggle() {
    if (this.gui._hidden) {
      this.gui.show();
    } else {
      this.gui.hide();
    }
  }

  // Удалить панель
  dispose() {
    this.gui.destroy();
  }
}
