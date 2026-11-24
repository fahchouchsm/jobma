export interface SubmitApplicationPayload {
  jobId: string;
  cvName?: string;
  note?: string;
}

export interface SubmitApplicationResult {
  ok: true;
  submittedAt: string;
}

/**
 * Submits a job application.
 * Currently simulates an async network request; replace with a real API call when backend is ready.
 */
export async function submitApplication(
  _payload: SubmitApplicationPayload
): Promise<SubmitApplicationResult> {
  await new Promise((resolve) => setTimeout(resolve, 650));
  return {
    ok: true,
    submittedAt: new Date().toISOString(),
  };
}
