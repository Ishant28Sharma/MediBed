"use client";

import { HospitalSearch } from '@/components/HospitalSearch';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();

  return (
    <HospitalSearch 
      onSelectHospital={(name) => {
        router.push(`/ward-selection?hospital=${encodeURIComponent(name)}`);
      }} 
    />
  );
}
