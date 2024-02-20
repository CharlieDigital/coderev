import dayjs from "dayjs";
import { deleteField, where } from "firebase/firestore";
import { sourceStorage } from "../utils/data/Storage";
import { useCandidates } from "./composables/candidates";

export const defaultWorkspace: Workspace = {
  uid: "default-workspace",
  name: "default",
  description: "default",
  collaborators: {},
  sources: {}
}

export const useWorkspaceStore = defineStore("useWorkspaceStore", () => {
  const appStore = useAppStore();

  const workspacesLoaded = ref(false);

  const workspaces = ref<Workspace[]>([]);

  const workspace = ref<Workspace>({...defaultWorkspace});

  /**
   * Resets the state of the workspace stores.
   */
  function reset() {
    workspacesLoaded.value = false
    workspaces.value = [],
    workspace.value = {...defaultWorkspace}
  }

  /**
   * Ensures that the workspace is loaded.
   * @param uid The UID of the workspace to load.
   */
  async function ensureWorkspace(uid: string) {
    if (workspace.value && workspace.value.uid === uid) {
      return;
    }

    // Unsubscribe the candidates when we switch workspaces.
    // ? Maybe there's a better place to do this?
    if (workspace.value.uid !== defaultWorkspace.uid) {
      firebaseSubscriptions
        .unsubscribe(`candidates.${workspace.value.uid}`)
    }

    console.log(`Ensuring workspace: ${uid}`)

    if (workspaces.value.length > 0) {
      const foundWorkspace = workspaces.value.find((w) => w.uid === uid);

      if (foundWorkspace) {
        workspace.value = foundWorkspace;
        return;
      }
    }

    try {
      const foundWorkspace = await workspaceRepository.findByUid(uid);

      if (foundWorkspace) {
        workspace.value = foundWorkspace;
      }
    } catch (e) {
      console.error(`An error occurred while loading the workspace: ${uid}`);
      console.error(e);
    }
  }

  /**
   * Loads the workspaces for the current profile.
   */
  async function loadWorkspaces() {
    if (workspacesLoaded.value) {
      return; // Already loaded
    }

    const { profile } = useAppStore()

    if (!profile || profile.uid === defaultProfile.uid) {
      return;
    }

    const subscriptionKey = `workspaces.${profile.uid}`

    if (firebaseSubscriptions.hasSubscription(subscriptionKey)) {
      return
    }

    workspaces.value.splice(0, workspaces.value.length);

    const workspacesSubscription = workspaceRepository.subscribe(
      {
        added: (newTrip) => {
          workspaces.value.push(newTrip);
        },
        modified: (modifiedWorkspace) => {
          findAndSplice(workspaces.value, modifiedWorkspace, true);
          findAndMerge(workspace.value, modifiedWorkspace);
        },
        removed: (removedWorkspace) => {
          findAndSplice(workspaces.value, removedWorkspace, false);
        },
      },
      where(`collaborators.${profile.uid}`, "!=", "")
    );

    firebaseSubscriptions.register(
      subscriptionKey,
      workspacesSubscription
    );

    workspacesLoaded.value = true;
  }

  /**
   * Adds a file to the current workspace.
   * @param file The file to add
   */
  async function addSource(file: File) {
    if (!workspace.value) {
      return
    }

    const result = await sourceStorage.addSourceFile(workspace.value.uid, file);

    console.log('Added file')
    console.log(result)

    await workspaceRepository.updateFields(workspace.value.uid, {
      [`sources.${result.uid}`] : {
        uid: result.uid,
        type: "document",
        path: result.path,
        url: result.url,
        name: file.name, // This is the original name.
        entityType: "document",
        addedUtc: dayjs.utc().toISOString()
      }
    })
  }

  /**
   * Removes a source document.
   * @param sourceUid The UID of the source to remove.
   * @param path The path of the file to remove from the backing store.
   */
  async function removeSource(
    sourceUid: string,
    path: string
  ) {
    if (!workspace.value) {
      console.log("No active workspace");
      return;
    }

    console.log(
      `Removing source: ${sourceUid} from workspace ${workspace.value.uid}`
    );

    await workspaceRepository.updateFields(workspace.value.uid, {
      [`sources.${sourceUid}`]: deleteField(),
    });
  }

  /**
   * Deletes a workspace and all of the artifacts associated with the workspace.
   * TODO: Move this to backend?
   * @param uid The UID of the workspace to delete
   * @param files The files for the workspace which need to be deleted.
   */
  async function deleteWorkspace(uid: string, files: MediaRef[]) {
    // Delete the candidates.
    const candidates = await candidateReviewRepository
      .findByFilter(where("workspaceUid", "==", uid))

    for (const c of candidates) {
      await candidateReviewRepository.deleteById(c.uid)
    }

    // Delete the files
    for (const file of files) {
      if  (!file.path) {
        continue
      }

      await sourceStorage.deleteFile(file.path)
    }

    // Delete the workspace
    await workspaceRepository.deleteById(uid)
  }

  return {
    workspace,
    workspaces,
    workspacesLoaded,
    ensureWorkspace,
    loadWorkspaces,
    addSource,
    removeSource,
    deleteWorkspace,
    reset,
    ...useCandidates(workspace)
  };
});
