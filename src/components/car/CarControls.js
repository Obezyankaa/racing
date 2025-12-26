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
      backward: false,
      left: false,
      right: false,
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
          this.state.backward = true;
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
    const ENGINE_FORCE = 200;
    const STEER_VALUE = 0.3;

    /* =========================
     * ENGINE
     * ========================= */
    if (this.state.forward) {
      this.car.setEngineForce(-ENGINE_FORCE);
    } else if (this.state.backward) {
      this.car.setEngineForce(ENGINE_FORCE);
    } else {
      this.car.setEngineForce(0);
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