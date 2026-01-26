// src/systems/InputController.js

export class InputController {
  constructor(bindings = []) {
    this.bindings = bindings;
    this.pressed = {};
    this.justPressed = {}; // для однократных нажатий
    this.justReleased = {};

    this.init();
  }

  init() {
    // Инициализируем состояния всех действий
    this.bindings.forEach((binding) => {
      this.pressed[binding.name] = false;
      this.justPressed[binding.name] = false;
      this.justReleased[binding.name] = false;
    });

    // Обработчики клавиатуры
    window.addEventListener("keydown", (e) => this.handleKeyDown(e));
    window.addEventListener("keyup", (e) => this.handleKeyUp(e));
  }

  handleKeyDown(event) {
    this.bindings.forEach((binding) => {
      if (binding.keys.includes(event.code)) {
        // Если клавиша не была нажата - это "justPressed"
        if (!this.pressed[binding.name]) {
          this.justPressed[binding.name] = true;
        }
        this.pressed[binding.name] = true;
      }
    });
  }

  handleKeyUp(event) {
    this.bindings.forEach((binding) => {
      if (binding.keys.includes(event.code)) {
        this.pressed[binding.name] = false;
        this.justReleased[binding.name] = true;
      }
    });
  }

  // Проверить, нажата ли клавиша (удерживается)
  isPressed(action) {
    return this.pressed[action] || false;
  }

  // Проверить, была ли клавиша только что нажата (один раз)
  isJustPressed(action) {
    return this.justPressed[action] || false;
  }

  // Проверить, была ли клавиша только что отпущена
  isJustReleased(action) {
    return this.justReleased[action] || false;
  }

  // Вызывать в конце каждого кадра
  update() {
    // Сбрасываем "just" состояния
    Object.keys(this.justPressed).forEach((key) => {
      this.justPressed[key] = false;
    });
    Object.keys(this.justReleased).forEach((key) => {
      this.justReleased[key] = false;
    });
  }

  // Добавить новую привязку клавиш
  addBinding(name, keys) {
    this.bindings.push({ name, keys });
    this.pressed[name] = false;
    this.justPressed[name] = false;
    this.justReleased[name] = false;
  }

  // Удалить привязку
  removeBinding(name) {
    this.bindings = this.bindings.filter((b) => b.name !== name);
    delete this.pressed[name];
    delete this.justPressed[name];
    delete this.justReleased[name];
  }

  // Очистка
  dispose() {
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
  }
}
