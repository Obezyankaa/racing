// src/utils/debug/CameraDebug.js
export class CameraDebug {
  constructor(pane, game) {
    const folder = pane.addFolder({ title: "📷 Camera" });

    folder
      .addBinding(game.cameraController.camera, "fov", {
        min: 30,
        max: 120,
        label: "FOV",
      })
      .on("change", () => {
        game.cameraController.camera.updateProjectionMatrix();
      });
  }
}
