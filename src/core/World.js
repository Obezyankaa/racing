// World.js
import * as THREE from "three";
import * as CANNON from "cannon-es";
import CannonDebugger from "cannon-es-debugger";
import Car from "../components/car/Car";
import Box from "../components/Box";
import Asphalt from "../components/Asphalt";
import Lights from "../components/Lights";

export default class World {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;

    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.82, 0);
    this.world.broadphase = new CANNON.SAPBroadphase(this.world);
    this.world.allowSleep = true;

    // ✅ Добавляем свет
    this.lights = new Lights(this.scene);

    this.box = new Box(this.scene, new THREE.Vector3(0, 12, 0), this.world);
    this.plane = new Asphalt(this.scene);
    this.cannonDebugger = new CannonDebugger(this.scene, this.world, {});
    // this.setMaterials();
    this.createFloor();
    this.createVehicle();
  }

  createFloor() {
    const planeShape = new CANNON.Plane();
    const groundMaterial = new CANNON.Material("ground");
    const planeBody = new CANNON.Body({ mass: 0 });
    planeBody.material = groundMaterial;
    planeBody.addShape(planeShape);
    planeBody.quaternion.setFromAxisAngle(
      new CANNON.Vec3(1, 0, 0),
      -Math.PI / 2
    );

    // 2. Добавь ContactMaterial между колёсами и полом
    const wheelMaterial = new CANNON.Material("wheel");

    // friction = трение, restitution = упругость
    const contactMaterial = new CANNON.ContactMaterial(
      groundMaterial,
      wheelMaterial,
      {
        friction: 0.6, // зависит от нужного сцепления
        restitution: 0.0, // ноль = не отскакивает
      }
    );

    // 3. Добавляем в физический мир
    this.world.addContactMaterial(contactMaterial);

    this.world.addBody(planeBody);
  }

  createVehicle() {
    // сюда можно вынести код создания автомобиля
    // в дальнейшем перенесем это в отдельный Car.js
    this.car = new Car(this.world);

    window.addEventListener("keydown", (e) => {
      this.car.handleInput(e.key, true);
    });
    window.addEventListener("keyup", (e) => {
      this.car.handleInput(e.key, false);
    });
  }

  // этот метод нужен для смены позицы камеры во время движения авто
  // updateCameraFollowCar() {
  //   if (!this.car) return;

  //   const carBody = this.car.body; // ✅ теперь используем правильно

  //   // Позиция машины
  //   const carPos = new THREE.Vector3(
  //     carBody.position.x,
  //     carBody.position.y,
  //     carBody.position.z
  //   );

  //   // Постоянное смещение камеры (например, чуть сзади и выше)
  //   const offset = new THREE.Vector3(-6, 5, 5);

  //   // Получаем позицию камеры = позиция машины + смещение
  //   const desiredCameraPos = carPos.clone().add(offset);

  //   // Обновляем позицию камеры (можно с плавностью)
  //   this.camera.position.lerp(desiredCameraPos, 0.1);

  //   // Камера смотрит на машину
  //   this.camera.lookAt(carPos);
  // }

  update(delta) {
    this.world.step(delta);
    // this.updateCameraFollowCar();
    this.cannonDebugger.update();
    this.car.update();
    this.box.update();
  }
}
