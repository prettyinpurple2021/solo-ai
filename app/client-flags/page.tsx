'use client';
// page.tsx, minimal example

import { useGateValue } from "@statsig/react-bindings";

export default function ClientFlagsPage() {
  const flag = useGateValue("my_feature_flag"); 

  return (
    <div>
      Flag Value: {flag ? 'PASSED' : 'FAILED'}
    </div>
  );
} 