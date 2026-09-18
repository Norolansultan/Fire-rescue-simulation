import { useEffect, useRef, useState } from "preact/hooks";
import { SessionOrchestrator, type SessionSnapshot } from "../../session/orchestrator.js";
import type { ScenarioContract } from "../../scenario/types.js";

export function useSession(scenario: ScenarioContract, condition: "directed" | "substitutive") {
  const orchestratorRef = useRef<SessionOrchestrator | null>(null);
  const [snapshot, setSnapshot] = useState<SessionSnapshot | null>(null);

  if (!orchestratorRef.current) {
    orchestratorRef.current = new SessionOrchestrator(scenario, condition);
  }

  useEffect(() => {
    const unsubscribe = orchestratorRef.current!.subscribe(setSnapshot);
    void orchestratorRef.current!.start();
    return unsubscribe;
  }, []);

  return { snapshot, orchestrator: orchestratorRef.current };
}
