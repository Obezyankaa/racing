import * as THREE from "three";

export default class Floor {
  constructor(scene) {
    this.scene = scene;

    /**
     * Loading manager
     */
    const loadingManager = new THREE.LoadingManager();

    loadingManager.onStart = () => {
      console.log("loading started");
    };

    loadingManager.onLoad = () => {
      console.log("all textures loaded");
    };

    loadingManager.onError = (url) => {
      console.error("error loading", url);
    };

    /**
     * Texture loader
     */
    const textureLoader = new THREE.TextureLoader(loadingManager);

    const diffuseMap = textureLoader.load(
      "/static/asphalt/textures/Asphalt_Diff_2K.jpg"
    );
    const normalMap = textureLoader.load(
      "/static/asphalt/textures/Asphalt_Nor_GL_2K.jpg"
    );
    const roughnessMap = textureLoader.load(
      "/static/asphalt/textures/Asphalt_Rough_2K.jpg"
    );

    /**
     * Настройки текстур на геометрии
     */
    diffuseMap.colorSpace = THREE.SRGBColorSpace;

    diffuseMap.wrapS =
      diffuseMap.wrapT =
      normalMap.wrapS =
      normalMap.wrapT =
      roughnessMap.wrapS =
      roughnessMap.wrapT =
        THREE.RepeatWrapping;

    diffuseMap.repeat.set(8, 8);
    normalMap.repeat.set(8, 8);
    roughnessMap.repeat.set(8, 8);

    /**
     * Геометрия
     */
    this.geometry = new THREE.PlaneGeometry(30, 30);

    /**
     * Материалы
     */
    /*
    this.material = new THREE.MeshStandardMaterial({
      // map → базовый цвет поверхности (albedo)
      // влияет ТОЛЬКО на цвет, не на свет, не на блики
      // если убрать — материал станет однотонным
      map: diffuseMap,

      // normalMap → фейковый микрорельеф без увеличения геометрии
      // отвечает за зерно, трещины, неровности
      // если убрать — поверхность станет «пластиковой»
      normalMap: normalMap,

      // roughnessMap → карта матовости
      // управляет тем, ГДЕ поверхность блестит, а где нет
      // без неё блики будут равномерными и неестественными
      roughnessMap: roughnessMap,

      // roughness → общий множитель шероховатости
      // 1   → использовать roughnessMap как есть (сухой асфальт)
      // <1  → сделать поверхность более блестящей (мокрый асфальт)
      // >1  → значения обрежутся до 1
      roughness: 1,

      // metalness → степень "металличности" материала
      // 0 → диэлектрик (асфальт, бетон, дерево, земля)
      // 1 → металл (железо, алюминий, хром)
      // для асфальта ВСЕГДА 0
      metalness: 0,

      // side → какие стороны полигона рисовать
      // FrontSide  → рисуется только лицевая сторона (быстрее, правильнее)
      // DoubleSide → рисуется с двух сторон (удобно для пола, но дороже)
      // если камера опустится под пол:
      //   FrontSide  → пол исчезнет
      //   DoubleSide → пол будет виден
      side: THREE.FrontSide,
    });
    */

    /**
     * Mesh
     */
    this.plane = new THREE.Mesh(
      this.geometry,
      new THREE.MeshBasicMaterial({ visible: false })
    );
    this.plane.rotation.x = -Math.PI * 0.5;
    this.plane.receiveShadow = true;


    this.grid = new THREE.GridHelper(
      30, // размер сетки совпадает с PlaneGeometry
      30, // 1 метр на клетку
      0x555555,
      0x777777
    );
    this.scene.add(this.grid);


    this.scene.add(this.plane);
  }
}
