import { firebaseConnector } from "./FirebaseConnector";
import {
  collection,
  deleteDoc,
  doc,
  type DocumentChangeType,
  type DocumentData,
  FieldValue,
  Firestore,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  QueryConstraint,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import type { Unsubscribe } from "firebase/auth";
import dayjs from "dayjs";

/**
 * Replaces an entity in a collection with a new one that has been updated.
 * @param collection The collection to splice
 * @param entity The entity that needs to be spliced out
 * @param replace The entity to replace it with.
 * @returns The index at which the entity was found and spliced.
 */
export function findAndSplice<T extends Entity>(
  collection: T[],
  entity: T,
  replace: boolean
) {
  let index = collection.findIndex((e) => e.uid === entity.uid);
  let removed: T[] = [];

  if (index < 0) {
    collection.push(entity);
    index = collection.length - 1;
  } else if (replace) {
    removed = collection.splice(index, 1, entity);
  } else {
    removed = collection.splice(index, 1);
  }

  return { index, removed };
}

/**
 * Searches an entity collection for a match and then performs a key-by-
 * key merge on the entity instead of replacing it.  This can prevent
 * some cases of cross updates causing one side to lose work when the
 * entire entity is replaced.
 * @param target The entity collection to search for the entity.
 * @param source The modified entity; source of incoming changes
 */
export function findAndMerge<T extends Entity>(target: T, source: T) {
  // Don't replace the whole object; make a key-by-key update.  If we
  // replace the whole object, we'll get a more jarring screen update.
  for (const key of Object.keys(source)) {
    if ((target as any)[key] === (source as any)[key]) {
      continue;
    }

    if (
      typeof (source as any)[key] === "object" &&
      JSON.stringify((target as any)[key]) ===
        JSON.stringify((source as any)[key])
    ) {
      continue;
    }

    (target as any)[key] = (source as any)[key];
  }
}

/**
 * Base class for repositories.  Provides abstractions for common CRUD operations and a
 * container for encapsulating the queries.
 */
export abstract class Repository<T extends Entity> {
  protected readonly db: Firestore;

  constructor(db?: Firestore) {
    if (db) {
      this.db = db;
    } else {
      this.db = firebaseConnector.db;
    }
  }

  /**
   * Inheriting classes override this class to provide the collection root.
   */
  protected abstract get collectionRoot(): string;

  /**
   * Retrieves a document from the collection using the UID.
   * @param uid The UID of the document to find.
   * @returns The document that matches the UID.
   */
  public async findByUid(uid: string): Promise<T | undefined> {
    const docRef = doc(this.db, this.collectionRoot, uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as T) : undefined;
  }

  /**
   * Creates an instance of document in Firestore.  The schema version, created
   * by, created at are set automatically.
   * @param entity The document entity to create.
   * @returns The instance that was created.
   */
  public async create(entity: T): Promise<T> {
    const { profile } = useAppStore();

    if (!profile) {
      throw Error("No profile available; user is not logged in.");
    }

    entity.schemaVersion = SCHEMA_VERSION;

    if (!entity.createdBy) {
      entity.createdBy = {
        uid: profile.uid,
        name: profile.name,
        addedUtc: dayjs.utc().toISOString(),
        entityType: "user",
      };
    }

    if (!entity.createdAtUtc) {
      entity.createdAtUtc = dayjs.utc().toISOString();
    }

    await setDoc(doc(this.db, this.collectionRoot, entity.uid), entity);

    return entity;
  }

  /**
   * Updates the document instance matching the entity UID in Firestore.  The
   * updated by and updated at are set automatically.
   * @param entity The document entity to update.
   */
  public async update(entity: T) {
    const { profile } = useAppStore();

    if (!profile) {
      throw Error("No profile available; user is not logged in.");
    }

    entity.updatedBy = {
      uid: profile.uid,
      name: profile.name,
      addedUtc: dayjs.utc().toISOString(),
      entityType: "user",
    };

    entity.updatedAtUtc = dayjs.utc().toISOString();

    await setDoc(doc(this.db, this.collectionRoot, entity.uid), entity);
  }

  /**
   * Updates a single field on the document.  The update need not include all fields
   * so we can accept a partial field.
   * @param uid The UID of the entity to update; does not need to be attached to the entity
   * @param entity The document entity to update.
   */
  public async updateFields(
    uid: string,
    entity: { [P in keyof T]?: T[P] | undefined | FieldValue }
  ) {
    const { profile } = useAppStore();

    if (!profile) {
      throw Error("No profile available; user is not logged in.");
    }

    entity.updatedBy = {
      uid: profile.uid,
      name: profile.name,
      addedUtc: dayjs.utc().toISOString(),
      entityType: "user",
    } as EmbeddedRef;

    entity.updatedAtUtc = dayjs.utc().toISOString();

    const docRef = doc(this.db, this.collectionRoot, uid);
    await updateDoc(docRef, entity as DocumentData);
  }

  /**
   * Creates a subscription to the underlying collection to handle changes.  This
   * subscription should be registered with firebaseSubscriptions!
   * @param handlers The event handlers for the subscription
   * @param condition A set of conditions to filter the subscription
   * @returns The subscription snapshot.
   */
  public subscribe(
    handlers: Record<DocumentChangeType, (doc: T) => void>,
    ...condition: QueryConstraint[]
  ): Unsubscribe {
    const q = query(collection(this.db, this.collectionRoot), ...condition);

    return onSnapshot(q, (snapshot) => {
      for (const docChange of snapshot.docChanges()) {
        handlers[docChange.type](docChange.doc.data() as T);
      }
    });
  }

  /**
   * Filters the document collection using the specified set of conditions.
   * @param condition An array of conditions which should be used as the query filter.
   */
  public async findByFilter(
    ...condition: QueryConstraint[]
  ): Promise<Array<T>> {
    const docRef = collection(this.db, this.collectionRoot);
    const q = query(docRef, ...condition);
    const snapshot = await getDocs(q);

    const records = new Array<T>();

    snapshot.forEach((doc) => {
      records.push(doc.data() as T);
    });

    return records;
  }

  /**
   * Deletes an entity document from the collection using the UID of the document.
   * @param uid The UID of the entity to delete
   */
  public async deleteById(uid: string) {
    await deleteDoc(doc(this.db, this.collectionRoot, uid));
  }
}
