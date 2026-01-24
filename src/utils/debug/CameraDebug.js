// src/utils/debug/CameraDebug.js
export class CameraDebug {
  constructor(gui, game) {
    const folder = gui.addFolder("📷 Camera");

    folder.add(game.cameraController.camera, "fov", 30, 120).onChange(() => {
      game.cameraController.camera.updateProjectionMatrix();
    });

    folder.open();
  }
}
