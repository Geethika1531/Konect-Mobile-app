import { create } from 'zustand';

export interface OnboardingData {
  // Step 1
  name: string;
  age: string;
  genderIdentity: string[];
  pronouns: string[];
  sexualOrientation: string[];
  intent: string;
  phoneNumber?: string;
  // Step 2
  photos: string[]; // local URIs before upload
  voiceNote: string | null; // local URI before upload
  // Step 3
  showMe: string[];
  distance: number;
  ageRange: [number, number];
  incognitoMode: boolean;
  photoBlur: boolean;
  disappearingMode: boolean;
}

interface OnboardingState {
  data: OnboardingData;
  updateData: (partialData: Partial<OnboardingData>) => void;
  reset: () => void;
}

const initialData: OnboardingData = {
  name: '',
  age: '',
  genderIdentity: [],
  pronouns: [],
  sexualOrientation: [],
  intent: '',
  photos: [],
  voiceNote: null,
  showMe: [],
  distance: 10,
  ageRange: [18, 35],
  incognitoMode: false,
  photoBlur: false,
  disappearingMode: false,
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  data: initialData,
  updateData: (partialData) => set((state) => ({ data: { ...state.data, ...partialData } })),
  reset: () => set({ data: initialData }),
}));
