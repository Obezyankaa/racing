// src/systems/CameraController.js
// ============================================================================
// КОНТРОЛЛЕР КАМЕРЫ
// ============================================================================
// Управляет камерой в игре. Поддерживает три режима:
// 1. observe - камера следит за машиной с фиксированного угла (изометрия)
// 2. chase - камера едет за машиной как в гоночных играх (NFS, GTA)
// 3. drag - свободное перемещение камеры мышкой по карте
// ============================================================================

import * as THREE from "three";

export class CameraController {
  constructor(renderer) {
    this.renderer = renderer;

    // ========================================================================
    // КАМЕРА
    // ========================================================================
    // PerspectiveCamera создаёт перспективную проекцию (как человеческий глаз)
    // Параметры: FOV (угол обзора), aspect ratio, near plane, far plane
    this.camera = new THREE.PerspectiveCamera(
      75,                                       // FOV - 75 градусов (стандарт для игр)
      window.innerWidth / window.innerHeight,  // Соотношение сторон экрана
      0.1,                                      // Ближняя плоскость отсечения
      1000                                      // Дальняя плоскость отсечения
    );

    // ========================================================================
    // РЕЖИМЫ КАМЕРЫ
    // ========================================================================
    this.mode = "observe"; // Текущий режим ("observe" | "chase" | "drag")

    // ========================================================================
    // НАСТРОЙКИ РЕЖИМА OBSERVE (изометрический вид)
    // ========================================================================
    // Камера находится на фиксированном смещении от машины
    // Пример: offset (5, 5, 5) = камера справа-сверху-сзади от машины
    this.observeOffset = new THREE.Vector3(5, 5, 5);
    this.observeSmoothSpeed = 5; // Скорость сглаживания движения камеры

    // ========================================================================
    // НАСТРОЙКИ РЕЖИМА CHASE (гоночный вид)
    // ========================================================================
    // Камера едет строго за машиной, поворачивается вместе с ней
    this.chaseConfig = {
      distance: 6,        // Расстояние от камеры до машины (сзади)
      height: 2.5,        // Высота камеры над машиной
      smoothSpeed: 5,     // Скорость сглаживания (больше = быстрее догоняет)
      lookAhead: 0,       // Смещение точки взгляда вперёд (0 = смотрим на машину)
    };

    // ========================================================================
    // НАСТРОЙКИ РЕЖИМА DRAG (свободное перемещение)
    // ========================================================================
    // Камера перемещается по карте при перетаскивании мышкой
    this.dragConfig = {
      sensitivity: 2,     // Чувствительность перетаскивания
      returnOnMove: true, // Возвращаться к машине когда она едет?
    };

    // ========================================================================
    // ВНУТРЕННЕЕ СОСТОЯНИЕ
    // ========================================================================

    // Текущая позиция камеры (используется для плавного движения через lerp)
    // lerp = linear interpolation (линейная интерполяция)
    // Вместо мгновенного перемещения камера плавно "догоняет" целевую позицию
    this.currentPosition = new THREE.Vector3(5, 5, 5);
    this.currentLookAt = new THREE.Vector3(0, 0, 0);
    this.camera.position.copy(this.currentPosition);

    // Состояние drag режима
    this.isDragging = false;            // Зажата ли кнопка мыши
    this.lastMouseX = 0;                // Последняя X координата мыши
    this.lastMouseY = 0;                // Последняя Y координата мыши
    this.dragPosition = new THREE.Vector3(5, 5, 5);  // Позиция камеры в drag режиме
    this.dragLookAt = new THREE.Vector3(0, 0, 0);    // Куда смотрит камера в drag режиме

    // ========================================================================
    // ОБРАБОТЧИКИ СОБЫТИЙ
    // ========================================================================
    // .bind(this) привязывает контекст, чтобы внутри обработчика this указывал
    // на экземпляр CameraController, а не на DOM элемент
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);

    // Подписываемся на события мыши на canvas
    renderer.domElement.addEventListener("mousedown", this.onMouseDown);
    renderer.domElement.addEventListener("mouseup", this.onMouseUp);
    renderer.domElement.addEventListener("mousemove", this.onMouseMove);

    // Обработка изменения размера окна
    window.addEventListener("resize", () => this.handleResize());
    this.handleResize();
  }

  // ==========================================================================
  // ОБРАБОТКА RESIZE
  // ==========================================================================
  // При изменении размера окна нужно обновить aspect ratio камеры
  handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    // После изменения параметров камеры нужно пересчитать матрицу проекции
    this.camera.updateProjectionMatrix();
  }

  // ==========================================================================
  // ПЕРЕКЛЮЧЕНИЕ РЕЖИМА
  // ==========================================================================
  setMode(mode) {
    // При переходе в drag режим запоминаем текущую позицию камеры
    // Это нужно чтобы камера не прыгала в другое место
    if (mode === "drag") {
      this.dragPosition.copy(this.camera.position);

      // Сохраняем направление взгляда камеры
      // getWorldDirection возвращает единичный вектор направления
      // Добавляем его к позиции камеры чтобы получить точку "куда смотрим"
      this.dragLookAt = this.camera.position.clone().add(
        this.camera.getWorldDirection(new THREE.Vector3())
      );
    }
    this.mode = mode;
  }

  // ==========================================================================
  // ОБРАБОТЧИКИ МЫШИ
  // ==========================================================================

  onMouseDown(event) {
    // event.button === 0 это левая кнопка мыши
    if (event.button === 0) {
      this.isDragging = true;
      // Запоминаем начальную позицию мыши для расчёта delta
      this.lastMouseX = event.clientX;
      this.lastMouseY = event.clientY;
    }
  }

  onMouseUp(event) {
    if (event.button === 0) {
      this.isDragging = false;
    }
  }

  onMouseMove(event) {
    // Если мышь не зажата - ничего не делаем
    if (!this.isDragging) return;

    // Вычисляем насколько сдвинулась мышь с прошлого кадра
    const deltaX = event.clientX - this.lastMouseX;
    const deltaY = event.clientY - this.lastMouseY;

    // Обновляем последнюю позицию для следующего кадра
    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;

    // Перемещаем камеру только в режиме drag
    if (this.mode === "drag") {
      // ====================================================================
      // ВЫЧИСЛЕНИЕ НАПРАВЛЕНИЙ ДВИЖЕНИЯ
      // ====================================================================
      // Нам нужно двигать камеру относительно её текущего направления,
      // а не в мировых координатах. Иначе "влево" всегда будет -X,
      // даже если камера повёрнута.

      // Получаем вектор "вправо" от камеры
      // 1. Берём направление взгляда камеры
      // 2. Делаем cross product с вектором "вверх" (0,1,0)
      // Cross product двух векторов даёт перпендикулярный вектор
      const right = new THREE.Vector3();
      const up = new THREE.Vector3(0, 1, 0);
      this.camera.getWorldDirection(right);
      right.cross(up).normalize(); // normalize делает длину вектора = 1

      // Получаем вектор "вперёд" (проекция на горизонтальную плоскость)
      // Убираем Y компонент чтобы двигаться только по горизонтали
      const forward = new THREE.Vector3();
      this.camera.getWorldDirection(forward);
      forward.y = 0;        // Игнорируем вертикальную составляющую
      forward.normalize();

      const sensitivity = this.dragConfig.sensitivity * 0.05;

      // ====================================================================
      // ПРИМЕНЕНИЕ ДВИЖЕНИЯ
      // ====================================================================
      // addScaledVector(vector, scale) добавляет vector * scale к вектору

      // Тянем мышь влево (deltaX < 0) → камера идёт вправо (инверсия)
      this.dragPosition.addScaledVector(right, -deltaX * sensitivity);
      this.dragLookAt.addScaledVector(right, -deltaX * sensitivity);

      // Тянем мышь вниз (deltaY > 0) → камера идёт вперёд
      this.dragPosition.addScaledVector(forward, deltaY * sensitivity);
      this.dragLookAt.addScaledVector(forward, deltaY * sensitivity);
    }
  }

  // ==========================================================================
  // ГЛАВНЫЙ UPDATE (вызывается каждый кадр)
  // ==========================================================================
  update(deltaTime, vehicle) {
    if (!vehicle || !vehicle.chassisMesh) return;

    const vehiclePos = vehicle.chassisMesh.position;
    const vehicleQuat = vehicle.chassisMesh.quaternion;

    // Проверяем движется ли машина
    const isMoving = vehicle.isMoving();

    // Если машина поехала и мы в drag режиме - возвращаемся к машине
    // Это удобно: осмотрел карту, нажал газ - камера сама вернулась
    if (isMoving && this.mode === "drag" && this.dragConfig.returnOnMove) {
      this.mode = "observe";
    }

    // Вызываем соответствующий метод обновления в зависимости от режима
    if (this.mode === "observe") {
      this.updateObserve(deltaTime, vehiclePos);
    } else if (this.mode === "chase") {
      this.updateChase(deltaTime, vehiclePos, vehicleQuat);
    } else if (this.mode === "drag") {
      this.updateDrag(deltaTime, vehiclePos);
    }

    // Камера смотрит на машину во всех режимах кроме drag
    // В drag режиме камера смотрит в сохранённом направлении
    if (this.mode !== "drag") {
      this.camera.lookAt(vehiclePos);
    }
  }

  // ==========================================================================
  // РЕЖИМ OBSERVE (изометрический вид)
  // ==========================================================================
  // Камера находится на фиксированном смещении от машины
  // При движении машины камера плавно следует за ней
  updateObserve(deltaTime, vehiclePos) {
    // Целевая позиция = позиция машины + фиксированное смещение
    const targetPosition = new THREE.Vector3();
    targetPosition.copy(vehiclePos);
    targetPosition.add(this.observeOffset);

    // ========================================================================
    // СГЛАЖИВАНИЕ ЧЕРЕЗ LERP
    // ========================================================================
    // lerp(target, factor) - линейная интерполяция
    // factor = 0 → остаёмся на месте
    // factor = 1 → мгновенно в target
    // factor = 0.1 → двигаемся на 10% к target за кадр
    //
    // Формула: 1 - Math.exp(-speed * deltaTime)
    // Это даёт плавное экспоненциальное затухание, независимое от FPS
    // При 60 FPS и 30 FPS движение будет выглядеть одинаково
    const lerpFactor = 1 - Math.exp(-this.observeSmoothSpeed * deltaTime);
    this.currentPosition.lerp(targetPosition, lerpFactor);

    this.camera.position.copy(this.currentPosition);
  }

  // ==========================================================================
  // РЕЖИМ CHASE (гоночный вид)
  // ==========================================================================
  // Камера едет строго за машиной, поворачивается вместе с ней
  updateChase(deltaTime, vehiclePos, vehicleQuat) {
    const { distance, height, smoothSpeed, lookAhead } = this.chaseConfig;

    // ========================================================================
    // ВЫЧИСЛЕНИЕ ПОЗИЦИИ ЗА МАШИНОЙ
    // ========================================================================
    // Нам нужна точка "сзади" от машины в её локальных координатах
    //
    // Вектор (0, 0, -1) = "назад" в локальных координатах машины
    // applyQuaternion поворачивает этот вектор согласно повороту машины
    //
    // Quaternion - это способ хранить поворот без gimbal lock
    // (проблема с углами Эйлера когда оси совпадают)
    const backDirection = new THREE.Vector3(0, 0, -1);
    backDirection.applyQuaternion(vehicleQuat);

    // Целевая позиция = машина + (назад * distance) + высота
    const targetPosition = new THREE.Vector3();
    targetPosition.copy(vehiclePos);
    targetPosition.addScaledVector(backDirection, distance);
    targetPosition.y += height;

    // Сглаженное движение камеры
    const lerpFactor = 1 - Math.exp(-smoothSpeed * deltaTime);
    this.currentPosition.lerp(targetPosition, lerpFactor);

    this.camera.position.copy(this.currentPosition);

    // Если lookAhead > 0, смотрим не на машину, а немного вперёд
    if (lookAhead > 0) {
      const forwardDirection = new THREE.Vector3(0, 0, 1);
      forwardDirection.applyQuaternion(vehicleQuat);

      const lookAtTarget = new THREE.Vector3();
      lookAtTarget.copy(vehiclePos);
      lookAtTarget.addScaledVector(forwardDirection, lookAhead);

      this.camera.lookAt(lookAtTarget);
    }
  }

  // ==========================================================================
  // РЕЖИМ DRAG (свободное перемещение)
  // ==========================================================================
  // Камера на независимой позиции, управляется мышкой
  updateDrag(deltaTime, vehiclePos) {
    // Просто применяем сохранённую позицию и направление взгляда
    // Перемещение происходит в onMouseMove
    this.camera.position.copy(this.dragPosition);
    this.camera.lookAt(this.dragLookAt);

    // Синхронизируем currentPosition для плавного перехода в другие режимы
    this.currentPosition.copy(this.dragPosition);
  }

  // ==========================================================================
  // ПУБЛИЧНЫЕ МЕТОДЫ
  // ==========================================================================

  getCamera() {
    return this.camera;
  }

  getMode() {
    return this.mode;
  }

  // Установка FOV (угол обзора)
  setFOV(fov) {
    this.camera.fov = fov;
    this.camera.updateProjectionMatrix();
  }

  // ==========================================================================
  // ОЧИСТКА
  // ==========================================================================
  // Важно удалять слушатели событий при уничтожении объекта
  // Иначе будут утечки памяти
  dispose() {
    this.renderer.domElement.removeEventListener("mousedown", this.onMouseDown);
    this.renderer.domElement.removeEventListener("mouseup", this.onMouseUp);
    this.renderer.domElement.removeEventListener("mousemove", this.onMouseMove);
  }
}
