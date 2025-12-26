# Car (Three.js + cannon-es RaycastVehicle) — разбор кода

Этот файл объясняет, **как устроен класс `Car.js`** в проекте: что относится к физике (cannon-es), что к визуалу (Three.js), как работает `RaycastVehicle`, и почему колёса “живут” не как обычные `Body`.

---

## 1) Два мира: Physics vs Render

- **cannon-es** — считает физику: гравитацию, столкновения, подвеску, силы, скорости.
- **three.js** — рисует картинку: меши, материалы, свет, тени.

Они **не синхронизируются сами**. Поэтому мы вручную каждый кадр копируем:
- `mesh.position <- body.position`
- `mesh.quaternion <- body.quaternion`

---

## 2) Константы

```js
const WHEEL_RADIUS = 0.45;
```

**Зачем:** один источник правды для радиуса колеса.
- В физике: `wheelOptions.radius`
- В визуале: `CylinderGeometry(radius, radius, ...)`

Если радиусы разные — появится “парение”, “утопание”, несостыковка визуала и физики.

---

## 3) Конструктор `constructor(scene)`

### 3.1 Физический корпус (chassis)

```js
const chassisShape = new CANNON.Box(new CANNON.Vec3(2, 0.5, 1));
const chassisBody = new CANNON.Body({ mass: 150 });
chassisBody.addShape(chassisShape);
chassisBody.position.set(0, 3, 0);
chassisBody.angularVelocity.set(0, -0.5, 0);
```

**Что это такое:**
- `Shape` — геометрия столкновения (сама по себе не существует в мире).
- `Body` — объект в физическом мире (масса, позиция, скорость), к которому добавляются shape.

**Зачем mass:**
- `mass > 0` → тело **динамическое** (падает, реагирует на силы).
- `mass = 0` → тело статическое (как земля).
Для машины масса обязана быть `> 0`, иначе подвеска и силы не имеют смысла.

**Про размеры:**
- `Box(Vec3(2, 0.5, 1))` — это **половинные размеры**.
- Итоговый размер формы: `4 × 1 × 2`.

**Зачем старт `y = 3`:**
даём машине “время” упасть и включить подвеску корректно.

---

### 3.2 Визуальный корпус (Three.js)

```js
const geometry = new THREE.BoxGeometry(4, 1, 2);
const material = new THREE.MeshStandardMaterial({ color: 0xff3333 });
const mesh = new THREE.Mesh(geometry, material);
mesh.castShadow = true;
scene.add(mesh);
```

**Что это:** просто картинка.
- Этот меш **не падает сам**.
- Он двигается только потому, что мы синхронизируем его с `chassisBody` в `update()`.

---

### 3.3 Сохраняем ссылки

```js
this.body = chassisBody;
this.mesh = mesh;
```

**Зачем:** чтобы:
- `World` мог добавить `this.body` в `CANNON.World`
- метод `update()` мог синхронизировать `this.mesh`

---

## 4) RaycastVehicle — логика машины

```js
const vehicle = new CANNON.RaycastVehicle({ chassisBody });
```

**Важно понять:**
- `RaycastVehicle` — это **не `Body`**.
- Он не “живёт” в мире как объект, он хранит логику: лучи, подвеску, силы.
- В `World` его нужно отдельно подключить: `vehicle.addToWorld(world)`.

---

## 5) `wheelOptions` — шаблон одного колеса

`wheelOptions` — это **настройки**, из которых при `vehicle.addWheel(...)` создаётся `wheelInfo`.

Ключевые параметры (простыми словами):

- `radius` — радиус колеса (влияет на клиренс и контакт с землёй).
- `directionLocal` — направление луча подвески (обычно `(0, -1, 0)` вниз).
- `suspensionStiffness` — жёсткость пружины: больше → жёстче, меньше → “лодка”.
- `suspensionRestLength` — длина подвески “в покое”.
- `dampingCompression` — демпфирование при **сжатии** (гасит удар при приземлении).
- `dampingRelaxation` — демпфирование при **разжатии** (гасит раскачку вверх).
- `frictionSlip` — сцепление колеса: меньше → легче скользит, больше → “липнет”.
- `rollInfluence` — влияние колёс на крен/переворот (обычно маленькое).
- `axleLocal` — ось вращения колеса в локальных координатах.
- `chassisConnectionPointLocal` — точка крепления колеса к корпусу (в локальных координатах корпуса).

---

## 6) Позиции колёс `wheelPositions`

```js
const wheelPositions = [
  new THREE.Vector3(-1, -0.3,  1), // 0 front-left
  new THREE.Vector3( 1, -0.3,  1), // 1 front-right
  new THREE.Vector3(-1, -0.3, -1), // 2 rear-left
  new THREE.Vector3( 1, -0.3, -1), // 3 rear-right
];
```

**Зачем `y = -0.3`:**
- центр корпуса: `0`
- низ корпуса: `-0.5` (при высоте 1)
- точка крепления колеса чуть выше днища → лучи подвески работают стабильнее.

---

## 7) Добавление колёс в `RaycastVehicle`

```js
wheelPositions.forEach((v) => {
  wheelOptions.chassisConnectionPointLocal.set(v.x, v.y, v.z);
  vehicle.addWheel(wheelOptions);
});
this.vehicle = vehicle;
```

**Что происходит:**
- `addWheel()` **добавляет новое колесо** в `vehicle.wheelInfos`.
- После цикла `wheelInfos.length === 4`.

---

## 8) Wheel bodies + Wheel meshes (как в demo)

### 8.1 Зачем вообще wheelBodies?

В `RaycastVehicle` колёса **не являются физическими телами**. Чтобы видеть колёса в дебаге/визуале как “объекты”, demo создаёт:
- `wheelBody` (KINEMATIC) — “прокси-объект” в физическом мире
- `wheelMesh` (Three.js) — визуальное колесо

Они **не влияют** на физику машины. Их роль — **отображение**.

### 8.2 Что значит KINEMATIC

- `KINEMATIC` не реагирует на силы.
- Мы сами задаём ему позицию/поворот каждый кадр.

```js
wheelBody.type = CANNON.Body.KINEMATIC;
wheelBody.collisionFilterGroup = 0; // отключаем столкновения
```

---

## 9) Линии подвески (debug)

`this.suspensionLines` — это `THREE.Line`, которые мы обновляем из:
- `wheelInfo.chassisConnectionPointWorld` (начало луча)
- `wheelInfo.directionWorld` (направление)
- длина: `suspensionRestLength + radius`

**Зачем:** мгновенно видеть, почему колесо “не находит землю”.

---

## 10) Управление с клавиатуры

В конструкторе создаём флаги:

```js
this.controls = { forward:false, backward:false, left:false, right:false };
```

И слушаем `keydown/keyup`, чтобы менять флаги. Важно: это только “состояние”, физика применяется в `update()`.

---

## 11) Индексы колёс (ОЧЕНЬ важно)

Индекс колеса = порядок добавления `addWheel()`.

По текущему `wheelPositions`:

| index | позиция | роль |
|------:|---------|------|
| 0 | (-1, -0.3,  1) | front-left |
| 1 | ( 1, -0.3,  1) | front-right |
| 2 | (-1, -0.3, -1) | rear-left |
| 3 | ( 1, -0.3, -1) | rear-right |

### Важно про текущий `Car.js`
Сейчас в коде методы используют индексы так:

- `setSteering`: `0` и `2`
- `setEngineForce`: `1` и `3`

Это **похоже на путаницу** относительно таблицы выше.

Обычно для “переднего руля + заднего привода” логично:
- steering: `0` и `1`
- engine force: `2` и `3`

> Пока мы это здесь только фиксируем как заметку. Исправлять будем отдельным шагом, чтобы видеть разницу осознанно.

---

## 12) `update()` — главный цикл синхронизации

В `update()` происходит 4 вещи по порядку:

1) **Синхронизация корпуса** (physics → render)
```js
this.mesh.position.copy(this.body.position);
this.mesh.quaternion.copy(this.body.quaternion);
```

2) **Обновление transforms колёс** из `RaycastVehicle`
- `vehicle.updateWheelTransform(i)` обновляет `wheelInfos[i].worldTransform`.

3) **Синхронизация wheelBodies + wheelMeshes**
- wheelBody получает position/quaternion из `worldTransform`
- wheelMesh получает position/quaternion из wheelBody
- плюс применяется “коррекция кватерниона” (потому что цилиндр в Three и ожидания осей в vehicle часто не совпадают)

4) **Применение управления**
- газ через `applyEngineForce`
- руль через `setSteeringValue`

5) **Рисование лучей подвески** (debug)

---

## 13) Типичные ошибки (и симптомы)

1) **Колёса “в корпусе” / “парят”**
- радиусы в physics и render разные
- визуальные колёса не синхронизируются с `worldTransform`

2) **Машина ложится на днище**
- `directionLocal` не вниз
- точка крепления колеса слишком высоко
- слишком короткая подвеска
- плохой тип земли (Plane часто даёт проблемы)

3) **Руль поворачивает “не те колёса”**
- перепутаны индексы в `setSteeringValue`

---

