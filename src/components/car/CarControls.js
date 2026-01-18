/**
 * CarControls — управление машиной
 *
 * Отвечает ТОЛЬКО за ввод и преобразование его
 * в вызовы методов Car:
 *  - setEngineForce
 *  - setSteering
 *
 * Не содержит физики и визуала
 */
export default class CarControls {
  constructor(car) {
    this.car = car;

    /* =========================
     * INPUT STATE
     * ========================= */
    this.state = {
      forward: false,
      backward: false, // будем использовать как REVERSE
      left: false,
      right: false,
      brake: false, // ⬅️ добавим
    };

    this._bindEvents();
  }

  /* =========================
   * KEYBOARD EVENTS
   * ========================= */
  _bindEvents() {
    window.addEventListener("keydown", (e) => {
      switch (e.code) {
        case "KeyW":
          this.state.forward = true;
          break;
        case "KeyS":
          this.state.backward = true; // задний ход
          break;
        case "Space":
          this.state.brake = true; // тормоз
          break;
        case "KeyA":
          this.state.left = true;
          break;
        case "KeyD":
          this.state.right = true;
          break;
      }
    });

    window.addEventListener("keyup", (e) => {
      switch (e.code) {
        case "KeyW":
          this.state.forward = false;
          break;
        case "KeyS":
          this.state.backward = false;
          break;
        case "Space":
          this.state.brake = false;
          break;
        case "KeyA":
          this.state.left = false;
          break;
        case "KeyD":
          this.state.right = false;
          break;
      }
    });
  }

  /**
   * Update loop
   * Вызывается каждый кадр из World / App
   */
  update() {
    const ENGINE_FORCE =
      this.car.drivingMode === "DRIFT" ? 520 : 260;
    const REVERSE_FORCE = 150;
    const BRAKE_FORCE = 5;
    const STEER_VALUE = 0.4;

    /* =========================
     * ENGINE / BRAKE / REVERSE
     * ========================= */

    if (this.state.brake) {
      // тормоз — приоритет выше всего
      this.car.setEngineForce(0);
      this.car.setBrake(BRAKE_FORCE);
    } else if (this.state.forward) {
      this.car.setBrake(0);

      let engineForce = -ENGINE_FORCE;

      // 🔥 Drift assist: если есть руль — слегка усиливаем тягу
      if (
        this.car.drivingMode === "DRIFT" &&
        (this.state.left || this.state.right)
      ) {
        engineForce *= 1.2; // +20% тяги ТОЛЬКО в заносе
      }

      this.car.setEngineForce(engineForce);
    } else if (this.state.backward) {
      // задний ход
      this.car.setBrake(0);
      this.car.setEngineForce(REVERSE_FORCE);
    } else {
      // ничего не жмём
      this.car.setEngineForce(0);
      this.car.setBrake(0);
    }

    /* =========================
     * STEERING
     * ========================= */

    if (this.state.left) {
      this.car.setSteering(STEER_VALUE);
    } else if (this.state.right) {
      this.car.setSteering(-STEER_VALUE);
    } else {
      this.car.setSteering(0);
    }
  }
}