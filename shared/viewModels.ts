/**
 * This file holds view models which are only used on the front-end.
 */

import { ReviewComment } from "./domainModels"
import { MediaRef } from "./models"

/**
 * Type used to represent user uploaded or created file.
 */
export type SourceFile = {
  /**
   * The extension with the leading .
   */
  ext: string

  /**
   * The full name of the file including the extension.
   */
  name: string

  /**
   * The text contents of the file.
   */
  text: string,

  /**
   * The last hash for this file; check against this to see if there's a change
   * in the contents.
   */
  hash?: string

  /**
   * When present, this means that the file has a backing reference stored in
   * Cloud Storage.  If this value is undefined, then the file hasn't been saved
   * yet.
   */
  ref?: MediaRef
}

/**
 * Represents a line selection in a source file.
 */
export type SourceSelection = {
  /**
   * The UID of the source reference.
   */
  sourceUid: string;

  /**
   * The name of the source reference.
   */
  sourceName: string;

  /**
   * The character index of the start of the selection.
   */
  from: number;

  /**
   * The character index of the end of the selection.
   */
  to: number;

  /**
   * The line index of the start of the selection.
   */
  fromLine: number;

  /**
   * The line index of the en of the selection.
   */
  toLine: number;
}

/**
 * Corresponds to the Quasar menu positions.
 */
export type MenuPosition =
  | "top left"
  | "top middle"
  | "top right"
  | "top start"
  | "top end"
  | "center left"
  | "center middle"
  | "center right"
  | "center start"
  | "center end"
  | "bottom left"
  | "bottom middle"
  | "bottom right"
  | "bottom start"
  | "bottom end"
  | undefined;

/**
 * Models a simple comment chain with one root comment.
 */
export type CommentChain = {
  /**
   * The root comment of the chain.
   */
  rootComment: ReviewComment

  /**
   * An array of reply comments.
   */
  replyComments: ReviewComment[]
}