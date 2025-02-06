import { deleteApp, initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import {
  connectAuthEmulator,
  FacebookAuthProvider,
  getAuth,
  GoogleAuthProvider,
  type NextFn,
  OAuthProvider,
  signInAnonymously,
  signInWithPopup,
  signOut,
  type User,
  GithubAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getFunctions, connectFunctionsEmulator, httpsCallable } from "firebase/functions";
import {
  Firestore,
  connectFirestoreEmulator,
  getFirestore,
} from "firebase/firestore";
import { Repository } from "./Repository";

class FirebaseConnector {
  /**
   * The Firebase configuration exported from the console.
   */
  private readonly firebaseConfig;

  private readonly googleProvider;
  private readonly microsoftProvider;
  private readonly facebookProvider;
  private readonly yahooProvider;
  private readonly githubProvider;
  private readonly functions;
  private readonly app;
  public readonly analytics;
  private auth;
  private readonly firestore;
  public readonly storage;
  public readonly sourceStorage;

  constructor() {
    console.log(`API_KEY: ` + import.meta.env.VITE_FIREBASE_API_KEY)

    this.firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    };

    this.googleProvider = new GoogleAuthProvider();
    this.githubProvider = new GithubAuthProvider();
    this.microsoftProvider = new OAuthProvider("microsoft.com");
    this.facebookProvider = new FacebookAuthProvider();
    this.yahooProvider = new OAuthProvider("yahoo.com");
    this.app = initializeApp(this.firebaseConfig);
    this.auth = getAuth(this.app);
    this.firestore = getFirestore(this.app);
    this.functions = getFunctions(this.app);
    this.storage = getStorage(this.app);
    this.sourceStorage = getStorage(
      this.app,
      import.meta.env.VITE_FIREBASE_SOURCE_STORAGE_BUCKET
    );

    if (
      import.meta.env.DEV ||
      window.location.hostname.toLowerCase() === "localhost"
    ) {
      console.log("⮑ Starting application in development mode.");
      connectAuthEmulator(this.auth, "http://localhost:9099", {
        disableWarnings: true,
      });
      connectFirestoreEmulator(this.db, "localhost", 8080);
      connectFunctionsEmulator(this.functions, "localhost", 5001);
      connectStorageEmulator(this.storage, "localhost", 9199);
      connectStorageEmulator(this.sourceStorage, "localhost", 9199);
    } else {
      this.analytics = getAnalytics(this.app);
    }

    this.auth.onAuthStateChanged(
      this.handleUserStateChanged as NextFn<User | null>
    );

    this.auth.onIdTokenChanged(
      this.handleTokenStateChanged as NextFn<User | null>
    );

    console.log("Connector initialized");
  }

  /**
   * The Firestore instance we're connected to.
   */
  public get db() {
    return this.firestore;
  }

  /**
   * The Firebase authentication connector.
   */
  public get authentication() {
    return this.auth;
  }

  /**
   * The Firebase functions connector.
   */
  public get fn() {
    return this.functions;
  }

  /**
   * Gets the authorization token for the current user.
   */
  public getCurrentUserToken() {
    return this.auth.currentUser?.getIdToken(false);
  }

  /**
   * Invoked when the token state changes; this can occur when the token is
   * refreshed automatically.  Triggers 3 times on sign in, sign out, and refresh.
   * @param user The user
   */
  private handleTokenStateChanged(user: User) {
    const appStore = useAppStore();

    if (!user) {
      console.log(` 🔐 Token state changed; no user present`);

      return;
    }

    console.log(` 🔐 Token state changed; user present`);

    if (appStore.profile && appStore.profile.uid !== defaultProfile.uid) {
      console.log(` 🔐 Profile already present: ${appStore.profile.email}`);
      return;
    }

    console.log(` 🔐 Setting user`);

    appStore.setUser(user).then(() => {
      console.log(` 🔐 Current location: ${window.location.href}; baseUrl: ${baseUrl}`);

      if (window.location.href.replace(/\/$/gi, '') === baseUrl) {
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect") ?? "/home";

      console.log(` 🔐 Redirect: ${redirect}`);

      const target = `${baseUrl}${redirect}`;

      // Only redirect if we're not already on the page and it's not the landing page
      if (target !== window.location.href) {
        console.log(` 🔐 Redirecting user to ${redirect}`);

        const router = useRouter();

        router.replace(redirect);
      }
    });
  }

  /**
   * Invoked when the user state is changed and the user is logged in.  This is
   * not as reliable since the user may already be considered logged in to the
   * SSO account so it may not trigger in all cases such as when the token is
   * still valid.
   * @param user The user
   */
  private handleUserStateChanged(user: User) {
    console.log(` 🔐 User state: ${user?.email ?? "logged out"}`);

    if (!user || !window.location.href.includes("login")) {
      console.log(` 🔐 No user or the URL is not the login page.`);
      return;
    }
  }

  /**
   * Creates a new user using the username and password
   * @param username The username supplied
   * @param password The password supplied
   */
  public async createEmailUser(username: string, password: string) {
    await createUserWithEmailAndPassword(this.auth, username, password)
  }

  /**
   * Unlike the `createEmailUser` account, this will not log the user into the
   * generated account.
   *
   * https://stackoverflow.com/a/77419918/116051
   * https://stackoverflow.com/a/38013551/116051
   *
   * We use a temporary app.
   *
   * @param username The username supplied
   * @param password The password supplied
   */
  public async provisionGeneratedAccount(
    username: string,
    password: string
  ) {
    // TODO: This maybe could be moved to a backend function?
    const tempApp = initializeApp(this.firebaseConfig, username);
    const tempAuth = getAuth(tempApp);

    if (
      import.meta.env.DEV ||
      window.location.hostname.toLowerCase() === "localhost"
    ) {
      console.log("⮑ Connecting tempAuth to emulator");
      connectAuthEmulator(tempAuth, "http://localhost:9099", {
        disableWarnings: true,
      });
    }

    await createUserWithEmailAndPassword(tempAuth, username, password);
    await signOut(tempAuth)

    // There is no deprovisioning of a created app?
    await deleteApp(tempApp)
  }

  /**
   * Unlike the previous method, this one we will make the call on the server.
   *
   * @param workspaceUid The UID of the workspace this account was generated for.
   * @param username The username supplied
   * @param password The password supplied
   * @param displayName The display name for the user
   * @param currentUserRef The current user reference
   */
    public async provisionGeneratedAccountViaFn(
      workspaceUid: string,
      username: string,
      password: string,
      displayName: string,
      currentUserRef: EmbeddedRef
    ) : Promise<GenerateAccountResponse> {
      const response = await httpsCallable<
        GenerateAccountRequest, GenerateAccountResponse
      >(this.functions, "generateAccount")({
        username,
        label: displayName,
        password: password,
        workspaceUid,
        createdBy: currentUserRef
      })

      if (!response.data.succeeded) {
        console.error(`Failed to generate account;`, response.data.message)
      }

      return response.data
    }

  /**
   * Performs a sign in with the supplied login name and password
   * @param username The username supplied
   * @param password The password supplied
   */
  public async loginEmailUser(username: string, password: string) {
    await signInWithEmailAndPassword(this.auth, username, password)
  }

  /**
   * Performs a login and then redirects the user to the requested page.
   */
  public async loginGoogle() {
    await this.login(this.googleProvider);
  }

  /**
   * Performs a login and then redirects the user to the requested page.
   */
  public async loginGithub() {
    await this.login(this.githubProvider);
  }

  /**
   * Performs the authentication using the designated method and then waits for the
   * serverless function to create a profile for the user.  We wait and check for a
   * profile periodically as it can take up to 6 seconds for the function to come
   * on line from a cold start.
   * @param setUser The function to set the user in the store.
   * @param router The router to use to redirect the user.
   * @param provider The provider to use for performing the authentication. When this value is null, use anonymous.
   */
  private async login(
    provider:
      | GoogleAuthProvider
      | OAuthProvider
      | FacebookAuthProvider
      | GithubAuthProvider
      | undefined
  ) {
    let authMethod = provider
      ? () => signInWithPopup(this.auth, provider)
      : () => signInAnonymously(this.auth);

    try {
      const result = await authMethod();

      // this.handleUserStateChanged(result.user);
    } catch (e) {
      console.error("An error occurred during login.");
      console.error(e);
    }
  }

  /**
   * Performs a logout and clears the current user from the store.
   * @param router The router instance used to route to the login page
   */
  public async logout() {
    console.log(" 🔐 Logout");

    // Use this to trigger unsubscribe in all contexts.
    firebaseSubscriptions.dispose();

    await signOut(this.auth);

    try {
      const appStore = useAppStore();
      appStore.clearUser();

      const workspaceStore = useWorkspaceStore();
      workspaceStore.reset();

      // This event triggers the subscriptions to be disposed.
      document.dispatchEvent(new Event("cr_logout"));

      navigateTo("/login");
    } catch (error) {
      console.log(error);
    }
  }
}

export const firebaseConnector = new FirebaseConnector();

/**
 * Repository for working with profiles.  Put here to deal with
 * issue with order of packing by Vite.
 */
class ProfileRepository extends Repository<Profile> {
  constructor(db?: Firestore) {
    super(db);
  }

  protected get collectionRoot(): string {
    return "profiles";
  }
}

export const profileRepository = new ProfileRepository();

/**
 * Repository for working with workspaces
 */
class WorkspaceRepository extends Repository<Workspace> {
  constructor(db?: Firestore) {
    super(db);
  }

  protected get collectionRoot(): string {
    return "workspaces";
  }
}

export const workspaceRepository = new WorkspaceRepository();

/**
 * Repository for working with the candidate reviews
 */
class CandidateReviewRepository extends Repository<CandidateReview> {
  constructor(db?: Firestore) {
    super(db);
  }

  protected get collectionRoot(): string {
    return "candidates";
  }
}

export const candidateReviewRepository = new CandidateReviewRepository();
