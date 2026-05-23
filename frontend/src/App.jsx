import { DocsSite } from "./pages/DocsSite";
import { OperatorInterface } from "./pages/OperatorInterface";

function isLocalOperatorHost() {
  const host = window.location.hostname;
  return host === "127.0.0.1" || host === "localhost" || host === "::1";
}

export default function App() {
  return isLocalOperatorHost() ? <OperatorInterface /> : <DocsSite />;
}
