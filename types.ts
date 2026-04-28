export type Screen = 'dashboard' | 'hospitals' | 'reports' | 'appointments' | 'settings' | 'flow' | 'ward-selection' | 'ai-assistant' | 'emergency';

export interface Vital {
  id: string;
  label: string;
  value: string | number;
  unit: string;
  icon: string;
  color: 'primary' | 'tertiary' | 'secondary' | 'error' | 'orange';
  trend: number[];
}

export interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  avatar: string;
}

export interface Report {
  id: string;
  title: string;
  date: string;
  type: 'blood' | 'radiology' | 'cardiology' | 'immunology';
  status: 'completed' | 'pending';
}

export interface Hospital {
  id: string;
  name: string;
  distance: string;
  location: string;
  generalBeds: number;
  icuUnits: number;
  tags: string[];
  demand: 'high' | 'optimal' | 'normal';
}

export interface Prescription {
  id: string;
  name: string;
  dosage: string;
  instructions: string;
  expires: string;
  status: 'active' | 'refill-pending' | 'completed';
}
