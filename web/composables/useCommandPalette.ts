/**
 * Composable for the command palette
 */
function useCommandPalette() {
  const showFileSelector = ref(false)

  function handleKeypress(e: KeyboardEvent) {
    if (!window.location.href.includes("/c/") && !window.location.href.includes("/review/")) {
      return;
    }

    if (e.key === "p" && e.getModifierState("Meta")) {
      e.preventDefault();
      showFileSelector.value = !showFileSelector.value;
    }
  }

  console.log("Connected event listener for keypress")

  window.addEventListener("keydown", handleKeypress);

  return {
    showFileSelector
  }
}

export const palette = useCommandPalette()
