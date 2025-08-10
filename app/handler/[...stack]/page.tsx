import { StackHandler } from "@stackframe/stack";
import { getStackServerApp } from "../../../stack";

export default function Handler(props: unknown) {
  const app = getStackServerApp()
  if (!app) {
    return null
  }
  return <StackHandler 
    fullPage 
    app={app} 
    routeProps={props}
  />;
}
