// src/utils/debug/CameraDebug.js
export class CameraDebug {
  constructor(pane, game) {
    this.pane = pane;
    this.game = game;

   this.PARAMS = {
     camera: "",
   };
    
    this.init();
    this.setValue("observe");
  }

  init() {
    const folder = this.pane.addFolder({ title: "📷 Camera" });
 
    
    folder
      .addBinding(this.PARAMS, "camera", {
        options: {
          free: "",
          default: "default",
          follow: "follow",
          observe: "observe",
        },
      })
      .on("change", (ev) => {
          this.setValue(ev.value)
      });;
  }

  setValue(value) {
    this.game.cameraController.changeMode(value);
  }
}
