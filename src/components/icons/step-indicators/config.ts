import { StepConfig } from '../base/types';

export const EXPERIENCE_STEPS: StepConfig[] = [
  {
    id: 'details',
    label: 'Experience Details',
    editable: true,
    order: 1
  },
  {
    id: 'hosts',
    label: 'Select Host',
    editable: true,
    order: 2
  },
  {
    id: 'location',
    label: 'Choose Venue',
    editable: true,
    order: 3
  },
  {
    id: 'participants',
    label: 'Manage Participants',
    editable: true,
    order: 4
  },
  {
    id: 'calendar',
    label: 'Schedule & Mining',
    editable: true,
    order: 5
  },
  {
    id: 'authentication',
    label: 'Authentication',
    editable: true,
    order: 6
  },
  {
    id: 'rks',
    label: 'Media & Marketing',
    editable: true,
    order: 7
  },
  {
    id: 'publish',
    label: 'Review & Publish',
    editable: false,
    order: 8
  }
];
