import dayjs from "dayjs";
import { computed } from "vue";

/**
 * Composable for wrapping the profile accepted options.
 */
export function useProfileOptions(profile: Ref<Profile>) {
  /**
   * True when the user has explicitly opted-in to receive updates.
   */
  const receiveEmails = computed({
    get() {
      if (typeof profile.value.receiveEmails === "undefined") {
        return false;
      }

      return profile.value.receiveEmails.active;
    },
    set(val: boolean) {
      profile.value.receiveEmails = {
        active: val,
        updatedUtc: dayjs.utc().toISOString(),
      };
    },
  });

  /**
   * True when the user has explicitly opted-in to receive requests for feedback.
   */
  const receiveFeedbackRequests = computed({
    get() {
      if (typeof profile.value.receiveFeedbackRequests === "undefined") {
        return false;
      }

      return profile.value.receiveFeedbackRequests.active;
    },
    set(val: boolean) {
      profile.value.receiveFeedbackRequests = {
        active: val,
        updatedUtc: dayjs.utc().toISOString(),
      };
    },
  });

  /**
   * Performs the update of the values and then updates the profile in the backing store.
   */
  async function updateNotificationOptions() {
    // Set the values from the computed values.  If the user closes the
    // dialog even without saving, we treat that as as setting it to FALSE.
    profile.value.receiveEmails = {
      active: receiveEmails.value,
      updatedUtc: dayjs.utc().toISOString(),
    };

    profile.value.receiveFeedbackRequests = {
      active: receiveFeedbackRequests.value,
      updatedUtc: dayjs.utc().toISOString(),
    };

    await profileRepository.updateFields(profile.value.uid, {
      receiveEmails: {
        active: receiveEmails.value,
        updatedUtc: dayjs.utc().toISOString(),
      },
      receiveFeedbackRequests: {
        active: receiveFeedbackRequests.value,
        updatedUtc: dayjs.utc().toISOString(),
      }
    });
  }

  return {
    receiveEmails,
    receiveFeedbackRequests,
    updateNotificationOptions,
  };
}
