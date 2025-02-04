import {
  GenerateAccountRequest,
  GenerateAccountResponse,
} from "./../../shared/messageModels";
import * as functions from "firebase-functions";
import {firebaseConnector} from "./ServerFirebaseConnector";

/**
 * Option to generate on the server side instead.
 */
export const generateAccount = functions
  .https.onCall({
    cors: ["https://coderev.app"],
    minInstances: 0,
    maxInstances: 5,
    timeoutSeconds: 240,
  }, async (
    request: functions.https.CallableRequest<GenerateAccountRequest>
  ) => {
    let response: GenerateAccountResponse = {
      succeeded: true,
      message: "Completed",
    };

    if (!request.auth) {
      response = {
        succeeded: false,
        message: "No authentication info",
      };

      return response;
    }

    const {username, password, label, workspaceUid, createdBy} = request.data;

    // TODO: Check if the user is in the workspace?

    console.info(`Generating user: ${username}`);

    const user = await firebaseConnector.auth.createUser({});

    console.info(`Updating user: ${username}`);

    await firebaseConnector.auth.updateUser(user.uid, {
      displayName: label,
      email: username,
      password: password,
    });

    console.info(`Setting claims on user: ${username}`);

    await firebaseConnector.auth.setCustomUserClaims(user.uid, {
      assigned_workspace_uid: workspaceUid,
      created_by_uid: createdBy.uid,
    });

    // eslint-disable-next-line
    console.info(`Generated user: ${username} (requested by ${createdBy.name} (${createdBy.uid}))`);

    return response;
  });
