import { generateAccount } from './generateAccount';
import { firebaseConnector } from './ServerFirebaseConnector';

console.log("Starting functions...");

// Initialize the Firebase Admin SDK
firebaseConnector.start();

exports.generateAccount = generateAccount;
