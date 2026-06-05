/**
 * Telematics sensor manager — REAL device sensors & dynamic calibration.
 *
 * Uses expo-sensors (Accelerometer + Gyroscope) to stream live hardware data
 * from the device's IMU at 10 Hz (100 ms intervals).
 *
 * Employs a low-pass filter to track the gravity vector, projecting raw IMU reads
 * into the vehicle's true coordinate frame (Longitudinal, Lateral, Vertical, Yaw, and Handling).
 *
 * Falls back to a simulation ticker if sensors are unavailable (e.g., on web or emulator).
 */

import { Accelerometer, Gyroscope } from 'expo-sensors';
import { settingsManager } from './settingsManager';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SensorData {
  accelerometer: {
    x: number;
    y: number;
    z: number;
    magnitude: number;
  };
  gyroscope: {
    x: number;
    y: number;
    z: number;
  };
  vehicle: {
    longitudinal: number; // forward/backward G-force (positive: acceleration, negative: braking)
    lateral: number;      // left/right G-force (positive: left turn, negative: right turn)
    vertical: number;     // up/down G-force (deviation from gravity)
    yawRate: number;      // rotational velocity around gravity (rad/s)
    handlingRate: number; // rotational velocity orthogonal to gravity (phone handling/rotation)
    isCalibrated: boolean;
  };
}

export type SimulatedEventType = 'braking' | 'acceleration' | 'turn' | 'phone_handling';

type SensorCallback = (data: SensorData) => void;

// ─── Internal state ───────────────────────────────────────────────────────────

/** Sensor update interval in milliseconds (10 Hz) */
const SENSOR_INTERVAL_MS = 100;

let subscribers = new Set<SensorCallback>();

/** Latest values from each sensor; merged on each broadcast */
let latestAccel = { x: 0, y: 0, z: 1.0 };
let latestGyro  = { x: 0, y: 0, z: 0 };

/** Dynamic gravity vector (LPF tracker) */
let gravity = { x: 0, y: 0, z: 1.0 };

/** Estimated vehicle forward unit vector in phone coordinate system */
let uForward: { x: number; y: number; z: number } | null = null;

/** Flag indicating forward vector is dynamically aligned */
let isCalibrated = false;

/** Subscription handles returned by expo-sensors */
let accelSubscription: ReturnType<typeof Accelerometer.addListener> | null = null;
let gyroSubscription:  ReturnType<typeof Gyroscope.addListener>  | null = null;

/** Broadcast interval when using real sensors */
let broadcastInterval: ReturnType<typeof setInterval> | null = null;

/** Fallback simulation interval (no hardware) */
let simulationInterval: ReturnType<typeof setInterval> | null = null;

/** Flag: are we running real sensors or simulation? */
let isSimulating = false;

/** Manual telemetry override queue for testing spikes */
let pendingVehicleOverride: {
  longitudinal: number;
  lateral: number;
  vertical: number;
  yawRate: number;
  handlingRate: number;
} | null = null;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

function broadcast(accel: { x: number; y: number; z: number }, gyro: { x: number; y: number; z: number }) {
  const magnitude = Math.sqrt(accel.x ** 2 + accel.y ** 2 + accel.z ** 2);

  let longitudinal = 0;
  let lateral = 0;
  let vertical = 0;
  let yawRate = 0;
  let handlingRate = 0;

  if (isSimulating) {
    // Simulation mode assumes perfectly flat/aligned orientation
    longitudinal = accel.y;
    lateral = accel.x;
    vertical = accel.z - 1.0;
    yawRate = gyro.z;
    handlingRate = Math.sqrt(gyro.x ** 2 + gyro.y ** 2);
  } else {
    // ─── Dynamic Coordinate Alignment Algorithm ───

    // 1. Gravity Vector Tracking (Low-Pass Filter, alpha = 0.95 at 10 Hz)
    const alpha = 0.95;
    gravity.x = alpha * gravity.x + (1 - alpha) * accel.x;
    gravity.y = alpha * gravity.y + (1 - alpha) * accel.y;
    gravity.z = alpha * gravity.z + (1 - alpha) * accel.z;

    const gMag = Math.sqrt(gravity.x ** 2 + gravity.y ** 2 + gravity.z ** 2) || 1.0;
    const ux = gravity.x / gMag;
    const uy = gravity.y / gMag;
    const uz = gravity.z / gMag;

    // 2. Vertical G-Force component (projection along gravity)
    const aVertRaw = accel.x * ux + accel.y * uy + accel.z * uz;
    vertical = aVertRaw - gMag;

    // 3. Horizontal dynamic acceleration vector (orthogonal to gravity)
    const hx = accel.x - aVertRaw * ux;
    const hy = accel.y - aVertRaw * uy;
    const hz = accel.z - aVertRaw * uz;
    const hMag = Math.sqrt(hx ** 2 + hy ** 2 + hz ** 2);

    // 4. Rotational analysis: Yaw (around gravity) vs. pitch/roll (handling)
    yawRate = gyro.x * ux + gyro.y * uy + gyro.z * uz;

    const hGyroX = gyro.x - yawRate * ux;
    const hGyroY = gyro.y - yawRate * uy;
    const hGyroZ = gyro.z - yawRate * uz;
    handlingRate = Math.sqrt(hGyroX ** 2 + hGyroY ** 2 + hGyroZ ** 2);

    // 5. Initialize uForward (forward direction) based on phone pose
    if (uForward === null) {
      let fx = 0;
      let fy = 0;
      let fz = 0;

      if (Math.abs(uz) > Math.abs(uy)) {
        // Flat phone placement: project local Y-axis onto horizontal plane
        fx = -uy * ux;
        fy = 1 - uy ** 2;
        fz = -uy * uz;
      } else {
        // Vertical mount placement: project local -Z-axis onto horizontal plane
        fx = uz * ux;
        fy = uz * uy;
        fz = -1 + uz ** 2;
      }

      const fMag = Math.sqrt(fx ** 2 + fy ** 2 + fz ** 2) || 1.0;
      uForward = { x: fx / fMag, y: fy / fMag, z: fz / fMag };
    }

    // 6. Dynamic alignment updates (when accelerating straight without turning)
    if (hMag > 0.15 && Math.abs(yawRate) < 0.15) {
      const dot = hx * uForward.x + hy * uForward.y + hz * uForward.z;
      if (dot > 0) { // Accelerating forward
        const targetX = hx / hMag;
        const targetY = hy / hMag;
        const targetZ = hz / hMag;

        // Slow nudge towards true velocity vector
        uForward.x = uForward.x * 0.98 + targetX * 0.02;
        uForward.y = uForward.y * 0.98 + targetY * 0.02;
        uForward.z = uForward.z * 0.98 + targetZ * 0.02;

        const ufMag = Math.sqrt(uForward.x ** 2 + uForward.y ** 2 + uForward.z ** 2) || 1.0;
        uForward.x /= ufMag;
        uForward.y /= ufMag;
        uForward.z /= ufMag;
        isCalibrated = true;
      }
    }

    // 7. Calculate aligned longitudinal and lateral acceleration
    longitudinal = hx * uForward.x + hy * uForward.y + hz * uForward.z;

    // uLateral = gravity_unit x uForward
    const lx = uy * uForward.z - uz * uForward.y;
    const ly = uz * uForward.x - ux * uForward.z;
    const lz = ux * uForward.y - uy * uForward.x;
    lateral = hx * lx + hy * ly + hz * lz;
  }

  // 8. Apply manual QA overrides
  if (pendingVehicleOverride) {
    if (pendingVehicleOverride.longitudinal !== undefined) longitudinal = pendingVehicleOverride.longitudinal;
    if (pendingVehicleOverride.lateral !== undefined)      lateral      = pendingVehicleOverride.lateral;
    if (pendingVehicleOverride.vertical !== undefined)     vertical     = pendingVehicleOverride.vertical;
    if (pendingVehicleOverride.yawRate !== undefined)      yawRate      = pendingVehicleOverride.yawRate;
    if (pendingVehicleOverride.handlingRate !== undefined) handlingRate = pendingVehicleOverride.handlingRate;
    pendingVehicleOverride = null;
  }

  const snapshot: SensorData = {
    accelerometer: {
      x:         round3(accel.x),
      y:         round3(accel.y),
      z:         round3(accel.z),
      magnitude: round3(magnitude),
    },
    gyroscope: {
      x: round3(gyro.x),
      y: round3(gyro.y),
      z: round3(gyro.z),
    },
    vehicle: {
      longitudinal: round3(longitudinal),
      lateral:      round3(lateral),
      vertical:     round3(vertical),
      yawRate:      round3(yawRate),
      handlingRate: round3(handlingRate),
      isCalibrated,
    },
  };
  subscribers.forEach((cb) => cb(snapshot));
}

// ─── Real-sensor path ─────────────────────────────────────────────────────────

async function startRealSensors(): Promise<boolean> {
  try {
    const [accelAvailable, gyroAvailable] = await Promise.all([
      Accelerometer.isAvailableAsync(),
      Gyroscope.isAvailableAsync(),
    ]);

    if (!accelAvailable || !gyroAvailable) return false;

    Accelerometer.setUpdateInterval(SENSOR_INTERVAL_MS);
    Gyroscope.setUpdateInterval(SENSOR_INTERVAL_MS);

    accelSubscription = Accelerometer.addListener(({ x, y, z }) => {
      latestAccel = { x, y, z };
    });

    gyroSubscription = Gyroscope.addListener(({ x, y, z }) => {
      latestGyro = { x, y, z };
    });

    // Broadcast fused readings
    broadcastInterval = setInterval(() => {
      broadcast(latestAccel, latestGyro);
    }, SENSOR_INTERVAL_MS);

    return true;
  } catch {
    return false;
  }
}

function stopRealSensors() {
  accelSubscription?.remove();
  gyroSubscription?.remove();
  accelSubscription = null;
  gyroSubscription  = null;

  if (broadcastInterval) {
    clearInterval(broadcastInterval);
    broadcastInterval = null;
  }
}

// ─── Simulation fallback path ─────────────────────────────────────────────────

function noise(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function startSimulation() {
  isSimulating = true;

  simulationInterval = setInterval(() => {
    const ax = noise(-0.04, 0.04);
    const ay = noise(-0.03, 0.03);
    const az = noise(0.96, 1.04);
    const gx = noise(-0.015, 0.015);
    const gy = noise(-0.015, 0.015);
    const gz = noise(-0.015, 0.015);

    broadcast({ x: ax, y: ay, z: az }, { x: gx, y: gy, z: gz });
  }, SENSOR_INTERVAL_MS);
}

function stopSimulation() {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
  isSimulating = false;
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

async function startSensors() {
  const forceDemo = settingsManager.getSettings().demoModeEnabled;
  if (forceDemo) {
    console.log('[SensorManager] Demo mode forced by settings — starting simulation');
    startSimulation();
    return;
  }

  const realStarted = await startRealSensors();
  if (!realStarted) {
    console.warn('[SensorManager] Hardware sensors unavailable — using simulation fallback');
    startSimulation();
  } else {
    console.log('[SensorManager] Real device sensors active with dynamic alignment at 10 Hz');
  }
}

function stopSensors() {
  stopRealSensors();
  stopSimulation();
  // Reset alignment and calibration state
  gravity = { x: 0, y: 0, z: 1.0 };
  uForward = null;
  isCalibrated = false;
  pendingVehicleOverride = null;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Subscribe to the live sensor stream.
 * Automatically starts sensors on the first subscriber and stops when
 * the last subscriber unsubscribes.
 *
 * @returns An unsubscribe function to call on component unmount.
 */
export function subscribeToSensors(callback: SensorCallback): () => void {
  const wasEmpty = subscribers.size === 0;
  subscribers.add(callback);

  if (wasEmpty) {
    startSensors();
  }

  return () => {
    subscribers.delete(callback);
    if (subscribers.size === 0) {
      stopSensors();
    }
  };
}

/**
 * Queue a simulated harsh-driving event.
 * Injects a one-shot coordinate override into the vehicle coordinate system,
 * ensuring event detection triggers reliably under any phone alignment or simulation.
 */
export function triggerSimulatedEvent(type: SimulatedEventType) {
  switch (type) {
    case 'braking':
      pendingVehicleOverride = {
        longitudinal: -0.55, // Harsh Braking threshold is < -0.4
        lateral: 0,
        vertical: 0,
        yawRate: 0,
        handlingRate: 0,
      };
      break;
    case 'acceleration':
      pendingVehicleOverride = {
        longitudinal: 0.52, // Harsh Acceleration threshold is > 0.4
        lateral: 0,
        vertical: 0,
        yawRate: 0,
        handlingRate: 0,
      };
      break;
    case 'turn':
      pendingVehicleOverride = {
        longitudinal: 0,
        lateral: 0.35, // Sharp Turn threshold is lateral > 0.25 and yaw > 0.5
        vertical: 0,
        yawRate: 0.68,
        handlingRate: 0,
      };
      break;
    case 'phone_handling':
      pendingVehicleOverride = {
        longitudinal: 0,
        lateral: 0,
        vertical: 0,
        yawRate: 0,
        handlingRate: 0.88, // Phone Handling threshold is > 0.8
      };
      break;
  }
}

/** Returns true when running on real hardware (not simulation) */
export function isUsingRealSensors(): boolean {
  return !isSimulating && (accelSubscription !== null || broadcastInterval !== null);
}

export const sensorManager = {
  subscribe: subscribeToSensors,
  triggerSimulatedEvent,
  isUsingRealSensors,
};

export default sensorManager;
