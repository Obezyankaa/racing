import * as CANNON from "cannon-es";

export default class Car {
  constructor(world) {
    this.world = world;

    // Шасси машины
    this.chassisBody = new CANNON.Body({
      mass: 150,
      position: new CANNON.Vec3(0, 6, 0),
      shape: new CANNON.Box(new CANNON.Vec3(2, 0.5, 1)), // уменьшено для реалистичного размера
    });
    this.body = this.chassisBody;

    // Создание RaycastVehicle
    this.vehicle = new CANNON.RaycastVehicle({
      chassisBody: this.chassisBody,
    });

    // Параметры колёс
    const wheelOptions = {
      radius: 0.5,
      directionLocal: new CANNON.Vec3(0, -1, 0),
      suspensionStiffness: 30,
      suspensionRestLength: 0.4,
      frictionSlip: 1.4,
      dampingRelaxation: 2.3,
      dampingCompression: 4.4,
      maxSuspensionForce: 100000,
      rollInfluence: 0.01,
      axleLocal: new CANNON.Vec3(0, 0, 1),
      maxSuspensionTravel: 0.3,
      customSlidingRotationalSpeed: -30,
      useCustomSlidingRotationalSpeed: true,
    };

    // 4 колеса
    const positions = [
      new CANNON.Vec3(-1, 0, 1), // FL
      new CANNON.Vec3(-1, 0, -1), // RL
      new CANNON.Vec3(1, 0, 1), // FR
      new CANNON.Vec3(1, 0, -1), // RR
    ];

    positions.forEach((pos) => {
      const options = {
        ...wheelOptions, // копируем все настройки
        chassisConnectionPointLocal: pos.clone(), // задаём текущую позицию
      };
      this.vehicle.addWheel(options);
    });

    // Добавление машины в физический мир
    this.vehicle.addToWorld(this.world);

    // Колёса для синхронизации (например, в THREE.js)
    this.wheelBodies = [];
    const wheelMaterial = new CANNON.Material("wheel");

    this.vehicle.wheelInfos.forEach((wheel) => {
      const cylinderShape = new CANNON.Cylinder(
        wheel.radius,
        wheel.radius,
        wheel.radius / 2,
        20
      );
      const wheelBody = new CANNON.Body({
        mass: 0,
        material: wheelMaterial,
        type: CANNON.Body.KINEMATIC,
      });

      // отключаем коллизии
      wheelBody.collisionFilterGroup = 0;

      // повернём цилиндр в нужную ориентацию
      const q = new CANNON.Quaternion().setFromEuler(-Math.PI / 2, 0, 0);
      wheelBody.addShape(cylinderShape, new CANNON.Vec3(), q);

      this.wheelBodies.push(wheelBody);
      this.world.addBody(wheelBody);
    });

    // Обновление позиции колёс после каждого шага симуляции
    this.world.addEventListener("postStep", () => {
      for (let i = 0; i < this.vehicle.wheelInfos.length; i++) {
        this.vehicle.updateWheelTransform(i);
        const t = this.vehicle.wheelInfos[i].worldTransform;
        this.wheelBodies[i].position.copy(t.position);
        this.wheelBodies[i].quaternion.copy(t.quaternion);
      }
    });
  }

  update() {
    // здесь можно синхронизировать 3D-модель машины
  }

  handleInput(key, isDown) {
    const maxSteerVal = 0.5;
    const maxForce = 1000;
    const brakeForce = 100000;

    switch (key) {
      case "w":
      case "ArrowUp":
        this.vehicle.applyEngineForce(isDown ? -maxForce : 0, 2);
        this.vehicle.applyEngineForce(isDown ? -maxForce : 0, 3);
        break;

      case "s":
      case "ArrowDown":
        this.vehicle.applyEngineForce(isDown ? maxForce : 0, 2);
        this.vehicle.applyEngineForce(isDown ? maxForce : 0, 3);
        break;

      case "a":
      case "ArrowLeft":
        this.vehicle.setSteeringValue(isDown ? maxSteerVal : 0, 0);
        this.vehicle.setSteeringValue(isDown ? maxSteerVal : 0, 1);
        break;

      case "d":
      case "ArrowRight":
        this.vehicle.setSteeringValue(isDown ? -maxSteerVal : 0, 0);
        this.vehicle.setSteeringValue(isDown ? -maxSteerVal : 0, 1);
        break;

      case " ":
      case "b":
        for (let i = 0; i < 4; i++) {
          this.vehicle.setBrake(isDown ? brakeForce : 0, i);
        }
        break;
    }
  }
}
