# 🚗 WheelOptions — параметры колёс для CANNON.RaycastVehicle

## 🔧 Общие настройки `wheelOptions`:

| Параметр                        | Тип          | Значение | Описание |
|---------------------------------|--------------|----------|----------|
| `radius`                        | `number`     | `0.5`    | Радиус колеса в метрах |
| `directionLocal`               | `Vec3`       | `(0, -1, 0)` | Направление подвески (вниз по Y) |
| `suspensionStiffness`          | `number`     | `30`     | Жёсткость подвески. Больше — жёстче |
| `suspensionRestLength`         | `number`     | `0.4`    | Длина подвески в "состоянии покоя" |
| `frictionSlip`                 | `number`     | `1.4`    | Сцепление с дорогой. Больше — меньше скольжения |
| `dampingRelaxation`            | `number`     | `2.3`    | Как быстро подвеска возвращается после растяжения |
| `dampingCompression`           | `number`     | `4.4`    | Как сильно подвеска гасит энергию при сжатии |
| `maxSuspensionForce`           | `number`     | `100000` | Максимальная сила, выдерживаемая подвеской |
| `rollInfluence`                | `number`     | `0.01`   | Влияние колеса на крен машины. Меньше — устойчивей |
| `axleLocal`                    | `Vec3`       | `(0, 0, 1)` | Ось вращения колеса (вдоль Z) |
| `maxSuspensionTravel`          | `number`     | `0.3`    | Максимальный ход подвески (в метрах) |
| `customSlidingRotationalSpeed`| `number`     | `-30`    | Поворот колеса при скольжении |
| `useCustomSlidingRotationalSpeed` | `boolean` | `true`   | Включить кастомную скорость скольжения |

---

## 🎯 Рекомендуемые значения для **спорткара**:

```js
const wheelOptions = {
  radius: 0.5,
  directionLocal: new CANNON.Vec3(0, -1, 0),
  suspensionStiffness: 30,
  suspensionRestLength: 0.35,
  frictionSlip: 1.8,
  dampingRelaxation: 2.5,
  dampingCompression: 4.5,
  maxSuspensionForce: 100000,
  rollInfluence: 0.01,
  axleLocal: new CANNON.Vec3(0, 0, 1),
  maxSuspensionTravel: 0.25,
  customSlidingRotationalSpeed: -30,
  useCustomSlidingRotationalSpeed: true,
};
