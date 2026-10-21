/** Scheduler-authored admission source for a stored job; leaf module for the timer hot path. */
import type { CronStoredJob } from "./types.js";

export type ScheduledAdmissionSource = "operator-schedule" | "requester-schedule";

/**
 * Admission source for a stored job. The only owner of this rule; any requester
 * signal on the job makes it requester-scoped.
 */
export function resolveCronJobAdmissionSource(
  job: Pick<CronStoredJob, "owner" | "scheduledToolPolicy" | "payload" | "toolsAllowProvenance">,
): ScheduledAdmissionSource {
  return job.owner?.sessionKey ||
    job.owner?.accountId ||
    job.scheduledToolPolicy?.mode === "account" ||
    (job.payload.kind === "agentTurn" && job.payload.externalContentSource) ||
    job.toolsAllowProvenance?.channelRequester ||
    (job.toolsAllowProvenance && job.toolsAllowProvenance.callerOrigin?.kind !== "local")
    ? "requester-schedule"
    : "operator-schedule";
}
