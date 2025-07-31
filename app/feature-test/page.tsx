import { createFeatureFlag } from "../../lib/flags";

export default async function FeatureTestPage() {
  const enabled = await createFeatureFlag("my_feature_flag")(); //Disabled by default, edit in the Statsig console
  return <div>myFeatureFlag is {enabled ? "on" : "off"}</div>
} 