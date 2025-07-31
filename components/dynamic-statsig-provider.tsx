"use client";

import type { Statsig } from "@flags-sdk/statsig";
import {
  StatsigProvider,
  useClientBootstrapInit,
} from "@statsig/react-bindings";
import { StatsigAutoCapturePlugin } from '@statsig/web-analytics';
 
export function DynamicStatsigProvider({ children, datafile,}: {
  children: React.ReactNode;
  datafile: Awaited<ReturnType<typeof Statsig.getClientInitializeResponse>> | null;
}) {
  // If no datafile provided (e.g., during build or when Statsig is unavailable), 
  // just render children without feature flags
  if (!datafile) {
    return <>{children}</>;
  }
 
  const client = useClientBootstrapInit(
    process.env.NEXT_PUBLIC_STATSIG_CLIENT_KEY as string,
    datafile.user,
    JSON.stringify(datafile),
    { plugins: [ new StatsigAutoCapturePlugin() ] } //Optional, will add autocaptured web analytics events to Statsig
  );
 
  return (
    <StatsigProvider user={datafile.user} client={client} >
      {children}
    </StatsigProvider>
  );
} 