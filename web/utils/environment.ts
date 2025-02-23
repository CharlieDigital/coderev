
/**
 * Returns the base URL depending on whether we are in a dev environment or not.
 */
export const baseUrl = import.meta.env.DEV
  ? "http://localhost:3000"
  : import.meta.env.VITE_PUBLISHED_BASE_URL

/**
 * The ID of the demo workspace.
 */
export const demoWorkspaceId = "DWJWmHIdofurrJtu"

/**
 * ID of a designated demo candidate.
 */
export const demoCandidateId = "wN0zcH1PNnXeVJWW"
