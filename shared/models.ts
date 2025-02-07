/**
 * Base model types
 */

/**
 * A minimal reference that references an entity with a date;
 */
export type MinimalRef = {
  /**
   * The UID of the entity being referenced.
   */
  uid: string;
  /**
   * UTC date and time that the reference was added.
   */
  addedUtc: string;
};

/**
 * An embedded reference.
 */
export type EmbeddedRef = {
  /**
   * The name of the entity being referenced.
   */
  name: string;
  /**
   * The type of the referenced entity.
   */
  entityType: string;
} & MinimalRef;

/**
 * Interface definition for entities.  This attaches fields to common types. All
 * top level collections are composed of Entity instances.
 */
export interface Entity {
  uid: string;
  name: string;
  createdAtUtc?: string;
  updatedAtUtc?: string | null;
  createdBy?: EmbeddedRef;
  updatedBy?: EmbeddedRef;
  schemaVersion?: string;
}

/**
 * The type of media.  A document can represent an uploaded PDF, for example.
 */
export type MediaType = "image" | "video" | "document";

/**
 * Type that represents the media for a given trip, place, or story.  Media is
 * stored against a trip directly.  Places and the story can then reference the
 * same media and reference the media order differently within the local scope.
 */
export type MediaRef = {
  /**
   * A global lexorank for the media for ordering purposes.
   */
  rank: string;

  /**
   * A full HTTP URL that points to the media location.
   */
  url: string;

  /**
   * The extension for the media.
   */
  ext: string;

  /**
   * The string path of the file that corresponds to the location in Firestore.
   */
  path?: string;

  /**
   * A display title for the media
   */
  title?: string;

  /**
   * A caption to display for the media
   */
  caption?: string;

  /**
   * Alternate text for the media
   */
  alt?: string;

  /**
   * The size of the media in bytes if it is stored.
   */
  size?: number;

  /**
   * If specified, a fixed width of the media.
   */
  width?: number;

  /**
   * If specified, a fixed height for the media.
   */
  height?: number;

  /**
   * The type the media.
   */
  type: MediaType;

  /**
   * When present, this means that the media ref has been marked for removal.
   * We need to do this because there may be references to the media elsewhere
   * that we don't want to break, but when the owning container is deleted, we want
   * to have a full set of refs to delete.
   */
  markAsRemovedUtc?: string;
} & MinimalRef;

/**
 * The type of content that is being referenced.
 */
export type ContentType = "url" | "document";

/**
 * Base type declaration for a profile which can be re-composed in other
 * contexts where we don't want the internal details of the profile state.
 */
export type ProfileBase = {
  /**
   * The display name associated with the profile.  This allows the user to provide
   * a different name than the one received from the OAuth flow.
   */
  displayName?: string;
  /**
   * The email address of the user.
   */
  email: string;
  /**
   * When this value is undefined, the user has not yet activated a
   * profile created on their behalf (e.g. via invite.). Once activated,
   * the value is updated to the activation date.
   */
  activatedUtc?: string;
  /**
   * A reference to a user photo.
   */
  photo?: MediaRef;
};

/**
 * User lifecycle events; the fields capture the date and time when the event
 * occurred
 */
export type ProfileEvent = {
  /**
   * Present then the user has watched or decined the intro video (so we don't show
   * it again)
   */
  experiencedIntroVideo?: string;

  /**
   * The user experienced the survey prompt.
   */
  experiencedSurvey?: string;
};

/**
 * This type is used to hold boolean records like the opt-in for the email
 * notification so we know what the user chose and when.
 */
export type BooleanRecord = {
  /**
   * The user selected value.
   */
  active: boolean;
  /**
   * The UTC date and time the record was updated.
   */
  updatedUtc: string;
};

/**
 * A type which represents the OAuth scopes the profile has granted.
 */
export type OAuthScopes = {
  google: string[];
};

/**
 * Type for archivable entities.
 */
export type Archivable = {
  /**
   * When present, the UTC date and time that the workspace was archived.
   */
  archivedAtUtc?: string;
}

/**
 * Maps a user profile which represents local user configuration information.
 * Profiles are a top level collection.
 */
export type Profile = {
  /**
   * User lifecycle events which indicate that the user has performed key steps
   */
  events?: ProfileEvent;
  /**
   * The scopes which have been granted by this user.  The actual tokens are stored
   * elsewhere, but this allows us to determine which features to show to the user.
   */
  scopes?: OAuthScopes;
  /**
   * When true, the user is opting in to receive emails.
   */
  receiveEmails?: BooleanRecord;
  /**
   * User is opting in to receive feedback requests.
   */
  receiveFeedbackRequests?: BooleanRecord;
} & ProfileBase &
  Entity;
