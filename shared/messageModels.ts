import { EmbeddedRef } from "./models";

/**
 * The base response type.
 */
export type ResponseBase = {
  /**
   * True when the operation completes without error
   */
  succeeded: boolean;
  /**
   * A message returned to the UI.
   */
  message: string;
};

/**
 * Request to generate an account for an anonymous user.
 */
export type GenerateAccountRequest = {
  /**
   * The generated username for this user.
   */
  username: string,
  /**
   * A label or n ame for the user.
   */
  label: string,
  /**
   * The generated password for the account.
   */
  password: string,
  /**
   * The workspace UID that this generated account was created for.
   */
  workspaceUid: string,
  /**
   * The ref to the user that created this account.
   */
  createdBy: EmbeddedRef
}

/**
 * Response to the account generation request.
 */
export type GenerateAccountResponse = {

} & ResponseBase
