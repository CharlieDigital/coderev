import * as admin from "firebase-admin";
import {getAuth} from "firebase-admin/auth";
import {getFirestore} from "firebase-admin/firestore";
import {getStorage} from "firebase-admin/storage";

/**
 * Class which encapsulates common Firebase components.
 */
class ServerFirebaseConnector {
  private readonly app;
  private readonly firestore;
  private readonly backingStorage;
  private readonly _auth;

  /**
   * Initializes the Firestore connection.
   */
  constructor() {
    this.app = admin.initializeApp();
    this.firestore = getFirestore(this.app);
    this.backingStorage = getStorage(this.app);
    this._auth = getAuth(this.app);

    this.firestore.settings({ignoreUndefinedProperties: true});
  }

  /**
   * Just logs the start.
   */
  public start() {
    console.log("Started!");
    console.log(`Connected to emulator? ${this.isEmulator}`);
  }

  /**
   * Returns true when the function is running in the emulator.
   */
  public get isEmulator() {
    return process.env.FUNCTIONS_EMULATOR === "true";
  }

  /**
   * The Firestore instance we're connected to.
   */
  public get db() {
    return this.firestore;
  }

  /**
   * The auth instance we're connected to.
   */
  public get auth() {
    return this._auth;
  }

  /**
   * The storage instance that we're connected to..
   */
  public get storage() {
    return this.backingStorage;
  }
}

export const firebaseConnector = new ServerFirebaseConnector();
