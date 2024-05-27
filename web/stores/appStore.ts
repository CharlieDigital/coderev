import type { User } from "firebase/auth";
import { where } from "firebase/firestore";
import { Dark } from "quasar";

export const defaultProfile: Profile = {
  uid: "default",
  name: "default",
  email: "default@coderev.app",
  createdAtUtc: "",
  createdBy: {
    uid: "default",
    name: "default",
    entityType: "user",
    addedUtc: "default",
  },
};

export const useAppStore = defineStore("appStore", () => {
  const dayjs = useDayjs();

  const dark = computed(() => Dark.isActive);

  const showLeftDrawer = ref(true)

  const showPreferencesDialog = ref(false)

  const currentUser = ref<User>();

  const profile = ref<Profile>({ ...defaultProfile });

  const user = computed(() => currentUser.value)

  let profileSubscriptionStarted = false;

  /**
   * Toggles dark mode.
   */
  function toggleDarkMode() {
    Dark.toggle();
  }

  /**
   * Clears the user from local storage and resets the application state.
   */
  function clearUser() {
    // Clear the user and token expiration time
    currentUser.value = undefined;
    profile.value = { ...defaultProfile };
    profileSubscriptionStarted = false;
  }

  /**
   * Gets an embedded ref that represents the current user.
   */
  function getCurrentUserRef(): EmbeddedRef {
    return {
      uid: profile.value?.uid ?? "",
      name: profile.value?.name ?? "",
      addedUtc: dayjs().utc().toISOString(),
      entityType: "profile",
    };
  }

  /**
   * Convenience method that converts a profile to a CollaboratorRef
   * @param profile The profile to convert to an invite ref.
   */
  function profileToCollaboratorRef(
    profile: Profile,
    role?: CollaboratorRole
  ): CollaboratorRef {
    return {
      uid: profile.uid,
      name: profile.name,
      addedUtc: dayjs().utc().toISOString(),
      entityType: "user",
      pending: !profile.activatedUtc ? true : false,
      role: role ?? "editor",
    };
  }

  /**
   * Convenience method to convert the current profile to a collaborator ref.
   */
  function getCurrentCollaboratorRef() {
    return profileToCollaboratorRef(profile.value, "owner");
  }

  /**
   * Sets the user and starts a profile subscription for updates to the user's profile.
   * @param authUser The authenticated user.
   */
  async function setUser(authUser: User) {
    console.log(` ⚡︎ Setting user: ${authUser.email}`)

    currentUser.value = authUser;

    // Get the profile by the email of the authenticated user.
    try {
      if (!profileSubscriptionStarted) {
        let userProfile: Profile =
          (
            await profileRepository.findByFilter(
              where("uid", "==", authUser.uid)
            )
          )?.[0] ?? undefined;

        if (!userProfile) {
          const name = authUser.displayName ?? `User ${authUser.uid}`

          console.log(`  ⮑ Creating profile for user: ${authUser.email}`)

          userProfile = {
            uid: authUser.uid,
            name: name,
            email: authUser.email ?? `user.${authUser.uid}@example.com`,
            createdAtUtc: dayjs().utc().toISOString(),
            createdBy: {
              uid: authUser.uid,
              name: name,
              addedUtc: dayjs().utc().toISOString(),
              entityType: "user"
            }
          }

          // Add the profile to the backend
          await profileRepository.create(userProfile);
        } else {
          console.log(`  ⮑ Retrieved profile for user: ${authUser.uid}`)
        }

        profile.value = userProfile;

        startSubscription();
      }
    } catch (error) {
      console.error("Error retrieving profile");
      console.log(error);
      clearUser();

      if (!window.location.href.includes("login")) {
        window.location.replace("/login");
      }
    }
  }

  /**
   * This subscription listens for server side updates of the the
   * profile.  For example, if the user completes a payment flow or
   * if the user connects their OAuth credentials.  We can pick up
   * back end changes with this.
   */
  function startSubscription() {
    if (!profile.value || profileSubscriptionStarted) {
      return;
    }

    console.log(` 📡 Subscribing profile for UID: ${profile.value.uid}`);

    const profileSubscription = profileRepository.subscribe(
      {
        added: (newProfile) => {
          // This shouldn't happen.
          profile.value = newProfile;
        },
        modified: (modifiedProfile) => {
          profile.value = modifiedProfile;
        },
        removed: (deletedProfile) => {
          clearUser();
          window.location.replace("/login");
        },
      },
      where("uid", "==", profile.value.uid)
    );

    firebaseSubscriptions.register(
      `profile.${profile.value.uid}`,
      profileSubscription
    );

    profileSubscriptionStarted = true;
  }

  return {
    dark,
    showLeftDrawer,
    showPreferencesDialog,
    user,
    profile,
    toggleDarkMode,
    getCurrentUserRef,
    getCurrentCollaboratorRef,
    setUser,
    clearUser,
  };
});
