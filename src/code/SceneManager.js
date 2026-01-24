// src/core/SceneManager.js

export class SceneManager {
  constructor(game) {
    this.game = game;
    this.currentScene = null;
    this.scenes = new Map();
  }

  // Регистрируем сцену
  registerScene(name, sceneClass) {
    this.scenes.set(name, sceneClass);
  }

  // Переключаемся на другую сцену
  async switchTo(sceneName) {
    // Выгружаем текущую сцену
    if (this.currentScene) {
      await this.currentScene.unload();
      this.currentScene = null;
    }

    // Загружаем новую
    const SceneClass = this.scenes.get(sceneName);
    if (!SceneClass) {
      console.error(`Scene "${sceneName}" not found`);
      return;
    }

    this.currentScene = new SceneClass(this.game);
    await this.currentScene.load();
  }

  update(deltaTime) {
    if (this.currentScene && this.currentScene.update) {
      this.currentScene.update(deltaTime);
    }
  }

  getCurrentScene() {
    return this.currentScene;
  }
}
