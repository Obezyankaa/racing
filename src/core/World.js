// World.js
import * as CANNON from "cannon-es";
import CannonDebugger from "cannon-es-debugger";
import Car from "../components/Car";

export default class World {
  constructor(scene) {
    this.scene = scene;

    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.82, 0);
    this.world.broadphase = new CANNON.SAPBroadphase(this.world);
    this.world.allowSleep = true;

    this.cannonDebugger = new CannonDebugger(this.scene, this.world, {});

    // this.setMaterials();
    this.createFloor();
    this.createVehicle();
  }

  //   setMaterials() {
  //     const defaultMaterial = new CANNON.Material("default");
  //     const defaultContactMaterial = new CANNON.ContactMaterial(
  //       defaultMaterial,
  //       defaultMaterial,
  //       {
  //         friction: 0.1,
  //         restitution: 0.3,
  //       }
  //     );
  //     this.world.defaultContactMaterial = defaultContactMaterial;
  //     this.world.addContactMaterial(defaultContactMaterial);
  //   }

  createFloor() {
    const planeShape = new CANNON.Plane();
    const planeBody = new CANNON.Body({ mass: 0 });
    planeBody.addShape(planeShape);
    planeBody.quaternion.setFromAxisAngle(
      new CANNON.Vec3(1, 0, 0),
      -Math.PI / 2
    );
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

  update(delta) {
    this.world.step(delta);
    this.cannonDebugger.update();
    this.car.update();
  }
}
