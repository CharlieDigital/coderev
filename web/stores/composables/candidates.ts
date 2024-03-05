import { QueryConstraint, orderBy, where } from "firebase/firestore";
import { defaultWorkspace } from "../workspaceStore";
import type { CandidateReview } from "../../../shared/domainModels";

export const defaultCandidate: CandidateReview = {
  uid: "default-candidate-review",
  name: "default",
  email: "default@example.com",
  workspaceUid: "default-workspace",
  workspaceName: "default",
  comments: {},
  sources: {},
};

/**
 * Composable for the workspace store; contains the scope for managing candidate
 * reviews.
 */
export function useCandidates(workspace: Ref<Workspace>) {
  /**
   * The candidate code reviews for this workspace.
   */
  const candidates: Ref<CandidateReview[]> = ref<CandidateReview[]>([]);

  /**
   * The active candidate review.
   */
  const candidate: Ref<CandidateReview> =
    ref<CandidateReview>(defaultCandidate);

  /**
   * These are the workspaces for which the current user performed a candidate
   * review.
   */
  const candidateWorkspaces: Ref<CandidateReview[]>  = ref<CandidateReview[]>([]);

  /**
   * The active selection range separate from the selected comment.  The selection
   * range can be updated by the user when selecting lines of code.
   */
  const selection: Ref<SourceSelection | undefined> = ref<SourceSelection>();

  /**
   * Represents the actively selected comment. When this changes, we will need to
   * change the selected file or the selected lines (if the file is already active)
   */
  const selectedComment: Ref<ReviewComment | undefined> = ref<ReviewComment>();

  /**
   * Loads a candidate from either the collection of candidates or from
   * the backing store.
   * @param uid The UID of the candidate to load
   */
  async function ensureCandidate(uid: string) {
    if (uid === defaultCandidate.uid) {
      return;
    }

    if (candidates.value.length > 0) {
      const foundCandidate = candidates.value.find((c) => c.uid === uid);

      if (foundCandidate) {
        candidate.value = foundCandidate;
        return;
      }
    }

    try {
      const foundCandidate = await candidateReviewRepository.findByUid(uid);

      if (foundCandidate) {
        candidate.value = foundCandidate;
      }
    } catch (e) {
      console.error(`An error occurred while loading the candidate: ${uid}`);
      console.error(e);
    }
  }

  /**
   * Loads the candidates for the current workspace.  To make these fields work,
   * they need to be reflected in an index to allow using multiple constraints.
   * @param candidateUid When present, this is the UID of a specific candidate to subscribe to.
   * @param email When present, the candidate email used for rule evaluation.
   * @param workspaceUid When present, the workspace UID.
   */
  async function loadCandidates(
    candidateUid?: string,
    email?: string,
    workspaceUid?: string
  ) {
    if (!workspaceUid && (workspace.value.uid === defaultWorkspace.uid)) {
      return;
    }

    // Prevent over subscribing.
    const subscriptionKey = `candidates.${workspace.value.uid}`

    if (firebaseSubscriptions.hasSubscription(subscriptionKey)) {
      return
    }

    const constraints: QueryConstraint[] = [
      where("workspaceUid", "==", workspaceUid ?? workspace.value.uid),
      orderBy("createdAtUtc", "desc")
    ]

    // These have to be reflected in an index in firestore.indexes.json
    if (candidateUid) {
      constraints.push(where("uid", "==", candidateUid))
    }

    if (email) {
      constraints.push(where("email", "==", email))
    }

    console.log(`Loading candidates for workspace: ${workspace.value.uid}`);

    candidates.value.splice(0, candidates.value.length);

    const candidatesSubscription = candidateReviewRepository.subscribe(
      {
        added: (newCandidate) => {
          candidates.value.push(newCandidate);
        },
        modified: (modifiedCandidate) => {
          findAndSplice(candidates.value, modifiedCandidate, true);
          findAndMerge(candidate.value, modifiedCandidate);
        },
        removed: (removedCandidate) => {
          findAndSplice(candidates.value, removedCandidate, false);
        },
      },
      ...constraints
    );

    firebaseSubscriptions.register(
      subscriptionKey,
      candidatesSubscription
    );
  }

  /**
   * When present, loads the workspaces for which the user is a candidate. In
   * other words, the workspaces that the user previously provided a review.
   * @param email The email address of the currently logged in user.
   */
  async function loadCandidateWorkspaces(
    email: string
  ) {
    // Prevent over subscribing.
    const subscriptionKey = `candidates.${email}`

    if (firebaseSubscriptions.hasSubscription(subscriptionKey)) {
      return
    }

    const constraints: QueryConstraint[] = [
      where("email", "==", email),
      orderBy("createdAtUtc", "desc")
    ]

    console.log(`Loading for workspaces for candidate: ${email}`);

    candidateWorkspaces.value.splice(0, candidateWorkspaces.value.length);

    const candidatesSubscription = candidateReviewRepository.subscribe(
      {
        added: (newCandidate) => {
          candidateWorkspaces.value.push(newCandidate);
        },
        modified: (modifiedCandidate) => {
          findAndSplice(candidateWorkspaces.value, modifiedCandidate, true);
        },
        removed: (removedCandidate) => {
          findAndSplice(candidateWorkspaces.value, removedCandidate, false);
        },
      },
      ...constraints
    );

    firebaseSubscriptions.register(
      subscriptionKey,
      candidatesSubscription
    );
  }

  return {
    candidates,
    candidate,
    selection,
    selectedComment,
    ensureCandidate,
    loadCandidates,
    loadCandidateWorkspaces,
    candidateWorkspaces
  };
}
