/// <reference lib="dom" />

import { Unsubscribe } from 'firebase/firestore'

/**
 * Plugin to manage global subscriptions
 */
class FirebaseSubscriptions {
  private _started: boolean = false
  private _subscriptions: Map<string, Unsubscribe> = new Map<
    string,
    Unsubscribe
  >()

  constructor() {
    // Add event listener to unsubscribe the subscription when the user leaves.
    document.addEventListener('pagehide', this.dispose.bind(this))
    document.addEventListener('cr_logout', this.dispose.bind(this))
  }

  /**
   * Returns true if there is an active subscription for the key.
   * @param name The key name of the subscription.
   */
  public hasSubscription(name: string) {
    return this._subscriptions.has(name)
  }

  /**
   * Registers a subscription so that it is automatically cleaned up on
   * unload or logout.  However, can also be cleaned up explicitly.
   * @param name The name to register the subscription for manual unsub
   * @param subscription The unsub callback
   */
  public register(name: string, subscription: Unsubscribe) {
    if (this._subscriptions.has(name)) {
      return
    }

    console.log(` 🔌 Registered subscription: "${name}"`)

    this._subscriptions.set(name, subscription)
  }

  /**
   * Unsubscribes the named subscription.
   * @param name The name the subscription was registred with.
   */
  public unsubscribe(name: string) {
    if (!this._subscriptions.has(name)) {
      return
    }

    const unsubscribe = this._subscriptions.get(name)
    console.log(` 🧹 Cleaning up subscription: ${name}`)
    if (unsubscribe) {
      unsubscribe()
    }

    this._subscriptions.delete(name)
  }

  /**
   * Invoked on the document visibilitychange event which occurs on unload of the page.
   */
  public dispose() {
    for (const [key] of this._subscriptions) {
      this.unsubscribe(key)
    }

    this._subscriptions.clear()
  }
}

export const firebaseSubscriptions = new FirebaseSubscriptions();
