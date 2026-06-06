/**
 * Global TypeScript definitions for the Kinetix application.
 */

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  createdAt: string;
  hasCompletedOnboarding?: boolean;
}

export interface TelemetryMetric {
  label: string;
  value: string;
  active?: boolean;
}
