// src/utils/debug/CameraDebug.js
// ============================================================================
// ДЕБАГГЕР КАМЕРЫ
// ============================================================================
// Панель настроек для тестирования параметров камеры в реальном времени
// ============================================================================

export class CameraDebug {
  constructor(pane, game) {
    this.pane = pane;
    this.game = game;
    this.cameraController = game.cameraController;

    this.PARAMS = {
      mode: "observe",
    };

    this.createFolder();
  }

  createFolder() {
    const folder = this.pane.addFolder({ title: "📷 Camera" });

    // ========================================================================
    // ВЫБОР РЕЖИМА
    // ========================================================================
    folder
      .addBinding(this.PARAMS, "mode", {
        label: "Mode",
        options: {
          "Observe (сбоку)": "observe",
          "Chase (за машиной)": "chase",
          "Drag (перетаскивание)": "drag",
        },
      })
      .on("change", (ev) => {
        this.cameraController.setMode(ev.value);
      });

    // ========================================================================
    // НАСТРОЙКИ КАМЕРЫ (общие)
    // ========================================================================
    const cameraFolder = folder.addFolder({ title: "Camera Settings" });

    // FOV - угол обзора
    cameraFolder
      .addBinding(this.cameraController.camera, "fov", {
        label: "FOV",
        min: 30,
        max: 120,
        step: 1,
      })
      .on("change", () => {
        this.cameraController.camera.updateProjectionMatrix();
      });

    // Near plane
    cameraFolder
      .addBinding(this.cameraController.camera, "near", {
        label: "Near Plane",
        min: 0.01,
        max: 10,
        step: 0.01,
      })
      .on("change", () => {
        this.cameraController.camera.updateProjectionMatrix();
      });

    // Far plane
    cameraFolder
      .addBinding(this.cameraController.camera, "far", {
        label: "Far Plane",
        min: 100,
        max: 5000,
        step: 100,
      })
      .on("change", () => {
        this.cameraController.camera.updateProjectionMatrix();
      });

    // ========================================================================
    // НАСТРОЙКИ OBSERVE
    // ========================================================================
    const observeFolder = folder.addFolder({ title: "Observe Mode" });

    observeFolder.addBinding(this.cameraController.observeOffset, "x", {
      label: "Offset X",
      min: -20,
      max: 20,
      step: 0.5,
    });

    observeFolder.addBinding(this.cameraController.observeOffset, "y", {
      label: "Offset Y (height)",
      min: 1,
      max: 30,
      step: 0.5,
    });

    observeFolder.addBinding(this.cameraController.observeOffset, "z", {
      label: "Offset Z",
      min: -20,
      max: 20,
      step: 0.5,
    });

    observeFolder.addBinding(this.cameraController, "observeSmoothSpeed", {
      label: "Smooth Speed",
      min: 0.5,
      max: 20,
      step: 0.5,
    });

    // ========================================================================
    // НАСТРОЙКИ CHASE
    // ========================================================================
    const chaseFolder = folder.addFolder({ title: "Chase Mode" });

    chaseFolder.addBinding(this.cameraController.chaseConfig, "distance", {
      label: "Distance",
      min: 2,
      max: 20,
      step: 0.5,
    });

    chaseFolder.addBinding(this.cameraController.chaseConfig, "height", {
      label: "Height",
      min: 0.5,
      max: 15,
      step: 0.5,
    });

    chaseFolder.addBinding(this.cameraController.chaseConfig, "smoothSpeed", {
      label: "Smooth Speed",
      min: 0.5,
      max: 20,
      step: 0.5,
    });

    chaseFolder.addBinding(this.cameraController.chaseConfig, "lookAhead", {
      label: "Look Ahead",
      min: 0,
      max: 20,
      step: 0.5,
    });

    // ========================================================================
    // НАСТРОЙКИ DRAG
    // ========================================================================
    const dragFolder = folder.addFolder({ title: "Drag Mode" });

    dragFolder.addBinding(this.cameraController.dragConfig, "sensitivity", {
      label: "Sensitivity",
      min: 0.5,
      max: 10,
      step: 0.1,
    });

    dragFolder.addBinding(this.cameraController.dragConfig, "returnOnMove", {
      label: "Return on Move",
    });

    // ========================================================================
    // ИНФОРМАЦИЯ (только чтение)
    // ========================================================================
    const infoFolder = folder.addFolder({ title: "Info (read-only)" });

    // Создаём объект для отображения позиции
    this.infoParams = {
      posX: 0,
      posY: 0,
      posZ: 0,
      mode: "observe",
    };

    infoFolder.addBinding(this.infoParams, "posX", {
      label: "Position X",
      readonly: true,
      format: (v) => v.toFixed(2),
    });

    infoFolder.addBinding(this.infoParams, "posY", {
      label: "Position Y",
      readonly: true,
      format: (v) => v.toFixed(2),
    });

    infoFolder.addBinding(this.infoParams, "posZ", {
      label: "Position Z",
      readonly: true,
      format: (v) => v.toFixed(2),
    });

    infoFolder.addBinding(this.infoParams, "mode", {
      label: "Current Mode",
      readonly: true,
    });

    // Обновляем инфо каждый кадр
    this.startUpdate();
  }

  startUpdate() {
    const update = () => {
      if (this.cameraController) {
        const pos = this.cameraController.camera.position;
        this.infoParams.posX = pos.x;
        this.infoParams.posY = pos.y;
        this.infoParams.posZ = pos.z;
        this.infoParams.mode = this.cameraController.getMode();

        // Синхронизируем dropdown с текущим режимом
        if (this.PARAMS.mode !== this.infoParams.mode) {
          this.PARAMS.mode = this.infoParams.mode;
        }
      }
      requestAnimationFrame(update);
    };
    update();
  }
}
