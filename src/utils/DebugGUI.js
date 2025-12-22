import GUI from "lil-gui";

export default class DebugGUI {
  constructor() {
    if (DebugGUI.instance) {
      return DebugGUI.instance;
    }

    this.gui = new GUI();
    DebugGUI.instance = this;
  }

  addFolder(name) {
    return this.gui.addFolder(name);
  }
}
