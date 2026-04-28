"use client";

import { WardSelection } from '@/components/WardSelection';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

function WardSelectionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const hospitalName = searchParams.get('hospital') || 'Selected Hospital';

  return (
    <WardSelection 
      hospitalName={hospitalName} 
      onBack={() => router.push('/hospitals')} 
    />
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-on-surface-variant font-medium">Loading ward mapping...</div>}>
      <WardSelectionContent />
    </Suspense>
  );
}
