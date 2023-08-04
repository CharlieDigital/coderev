/**
 * Domain specific model types built off of the base model types.
 */

import { Archivable, EmbeddedRef, Entity, MediaRef } from "./models";

/**
 * Defines the role types for the users on the workspace.
 */
export type CollaboratorRole = "owner" | "editor" | "reviewer";

/**
 * This type is used to model invites which include a pending property to indicate
 * that the invitation has not yet been accepted.
 */
export type CollaboratorRef = EmbeddedRef & {
  /**
   * When this is true, the collaborator has only been invited and has not yet
   * joined the trip.
   */
  pending: boolean;

  /**
   * The role for the collaborator
   */
  role: CollaboratorRole;
};

/**
 * Defines a workspace which contains a set of notes.
 */
export type Workspace = {
  /**
   * A description for the workspace
   */
  description?: string;

  /**
   * The collaborators who have created accounts to work on this trip.  The refs
   * point to user profiles.  The key is the UID.  This will always contain
   * the user who created the trip.
   */
  collaborators: Record<string, CollaboratorRef>;

  /**
   * When present, this value is an invite code that allows any user with a link
   * to join the trip.  This can simplify sending out individual invites.
   */
  inviteCode?: string;

  /**
   * Represents a set of content which every workspace is associated with.  A content
   * set can be associated with multiple workspaces.  For example, a set of documents
   * can be shared by multiple teams in different workspaces.
   */
  sources: Record<string, MediaRef>;
} & Entity & Archivable;

/**
 * The context type of a comment so we know what the comment is attached to.
 */
export type ContextType =
  | "source"
  | "comment"

/**
 * Defines a comment
 */
export type ReviewComment = {
  /**
   * A UID for this comment used for updates and deletion.
   */
  uid: string;

  /**
   * The body of the comment.
   */
  text: string

  /**
   * Represents a range in the source that the comment is referencing.
   */
  sourceRange?: number[]

  /**
   * Determines the type of context for this comment.
   */
  contextType: ContextType

  /**
   * The UID of the context which references either a source file or another comment.
   */
  contextUid: string

  /**
   * The reference to the author of the comment and also includes the timestamp.
   */
  author: EmbeddedRef
}

/**
 * This document represents a candidate review.  When we create it, we copy over
 * the media refs from the workspace.
 */
export type CandidateReview = {
  /**
   * The UID of the workspace that is referenced by this review.
   */
  workspaceUid: string;

  /**
   * Copy this value so we don't need to have permissions to read the workspace.
   */
  workspaceName: string;

  /**
   * The email address of the candidate that this review is assigned to.
   */
  email: string;

  /**
   * Represents a set of content which every workspace is associated with.  A content
   * set can be associated with multiple workspaces.  For example, a set of documents
   * can be shared by multiple teams in different workspaces.
   */
  sources: Record<string, MediaRef>;

  /**
   * The comments attached to this review.  The key is a unique ID for the
   * comment.
   */
  comments: Record<string, ReviewComment>;
} & Entity & Archivable;
