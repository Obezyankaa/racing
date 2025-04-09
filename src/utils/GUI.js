// utils/GUI.js
import GUI from "lil-gui";

class GlobalGUI {
  constructor() {
    this.gui = new GUI();
  }

  addFolder(name) {
    return this.gui.addFolder(name);
  }

  getGUI() {
    return this.gui;
  }

  destroy() {
    this.gui.destroy();
  }
}

export default new GlobalGUI();
