// src/utils/Debug.js
import { Pane } from "tweakpane";
import { LightingDebug } from "./debug/LightingDebug.js";
import { PhysicsDebug } from "./debug/PhysicsDebug.js";
import { InputDebug } from "./debug/InputDebug.js";
import { VehicleDebug } from "./debug/VehicleDebug.js";

export class Debug {
  constructor(game) {
    this.game = game;
    this.pane = new Pane({ title: "🎮 Debug Panel" });

    this.init();
  }

  init() {
    // Инициализируем отдельные debug модули
    new VehicleDebug(this.pane, this.game);
    new LightingDebug(this.pane, this.game);
    new PhysicsDebug(this.pane, this.game);
    new InputDebug(this.pane, this.game);

    // Можно добавить общую информацию
    this.addGeneralInfo();
  }

  addGeneralInfo() {
    const infoFolder = this.pane.addFolder({
      expanded: false,
      title: "ℹ️ Info",
    });

    this.info = {
      fps: 0,
    };

    // FPS счётчик
    let lastTime = performance.now();
    let frames = 0;

    infoFolder.addBinding(this.info, "fps", {
      readonly: true,
      label: "FPS",
    });

    const updateFPS = () => {
      frames++;
      const currentTime = performance.now();

      if (currentTime >= lastTime + 1000) {
        this.info.fps = frames;
        frames = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(updateFPS);
    };

    updateFPS();
  }

  // Показать/скрыть панель
  toggle() {
    if (this.pane.element.style.display === "none") {
      this.pane.element.style.display = "";
    } else {
      this.pane.element.style.display = "none";
    }
  }

  // Удалить панель
  dispose() {
    this.pane.dispose();
  }
}
