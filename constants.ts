import { Vital, Appointment, Report, Hospital, Prescription } from './types';

export const VITALS: Vital[] = [
  {
    id: 'hr',
    label: 'Heart Rate',
    value: 72,
    unit: 'BPM',
    icon: 'Heart',
    color: 'primary',
    trend: [65, 68, 75, 72, 70, 72, 74]
  },
  {
    id: 'bp',
    label: 'Blood Pressure',
    value: '118/75',
    unit: 'MMHG',
    icon: 'Activity',
    color: 'tertiary',
    trend: [120, 118, 115, 118, 119, 118, 117]
  },
  {
    id: 'spo2',
    label: 'SpO2 Level',
    value: 98,
    unit: '%',
    icon: 'Wind',
    color: 'secondary',
    trend: [97, 98, 98, 99, 98, 98, 98]
  },
  {
    id: 'temp',
    label: 'Body Temperature',
    value: 98.6,
    unit: '°F',
    icon: 'Thermometer',
    color: 'orange',
    trend: [98.4, 98.5, 98.6, 98.6, 98.7, 98.6, 98.6]
  }
];

export const APPOINTMENTS: Appointment[] = [
  {
    id: '1',
    doctorName: 'Dr. Aris Thorne',
    specialty: 'Neurological Follow-up',
    date: 'Oct 24',
    time: '10:30 AM',
    avatar: 'https://picsum.photos/seed/doc1/100/100'
  },
  {
    id: '2',
    doctorName: 'Dr. Sarah Vane',
    specialty: 'Routine Lab Review',
    date: 'Oct 28',
    time: '02:15 PM',
    avatar: 'https://picsum.photos/seed/doc2/100/100'
  }
];

export const REPORTS: Report[] = [
  {
    id: 'r1',
    title: 'Full Blood Count',
    date: '2023-10-15',
    type: 'blood',
    status: 'completed'
  },
  {
    id: 'r2',
    title: 'ECG Visualization',
    date: '2023-10-08',
    type: 'cardiology',
    status: 'completed'
  },
  {
    id: 'r3',
    title: 'Chest X-Ray',
    date: '2023-10-20',
    type: 'radiology',
    status: 'pending'
  },
  {
    id: 'r4',
    title: 'Lipid Panel',
    date: '2023-09-12',
    type: 'blood',
    status: 'completed'
  },
  {
    id: 'r5',
    title: 'Allergy Screening',
    date: '2023-10-22',
    type: 'immunology',
    status: 'pending'
  }
];

export const HOSPITALS: Hospital[] = [
  {
    id: 'h1',
    name: 'St. Etheria Medical Center',
    distance: '2.4 miles',
    location: 'Downtown Hub',
    generalBeds: 12,
    icuUnits: 3,
    tags: ['Cardiology', 'Emergency'],
    demand: 'high'
  },
  {
    id: 'h2',
    name: 'Lumina General Hospital',
    distance: '4.1 miles',
    location: 'North District',
    generalBeds: 45,
    icuUnits: 14,
    tags: ['Pediatrics', 'Neurology'],
    demand: 'optimal'
  },
  {
    id: 'h3',
    name: 'Westside Oncology Hub',
    distance: '5.8 miles',
    location: 'West Tech Park',
    generalBeds: 8,
    icuUnits: 2,
    tags: ['Oncology', 'Radiology'],
    demand: 'normal'
  }
];

export const PRESCRIPTIONS: Prescription[] = [
  {
    id: 'p1',
    name: 'Lisinopril 10mg',
    dosage: '10mg',
    instructions: 'Take 1 tablet daily in the morning for blood pressure management.',
    expires: 'Dec 2023',
    status: 'active'
  },
  {
    id: 'p2',
    name: 'Metformin 500mg',
    dosage: '500mg',
    instructions: 'Take twice daily with meals to regulate blood sugar levels.',
    expires: 'Jan 2024',
    status: 'refill-pending'
  }
];
