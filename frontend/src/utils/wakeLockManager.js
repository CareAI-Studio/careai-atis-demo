let wakeLockSentinel = null;
let wakeLockWanted = false;
let autoRestoreInitialized = false;

function isWakeLockSupported() {
  return Boolean("wakeLock" in navigator && navigator.wakeLock);
}

export async function requestWakeLock() {
  wakeLockWanted = true;

  if (!isWakeLockSupported()) {
    console.info("Screen Wake Lock API is not supported in this browser.");
    return false;
  }

  if (document.visibilityState !== "visible") {
    return false;
  }

  if (wakeLockSentinel) {
    return true;
  }

  try {
    wakeLockSentinel = await navigator.wakeLock.request("screen");

    wakeLockSentinel.addEventListener("release", () => {
      wakeLockSentinel = null;
    });

    return true;
  } catch (error) {
    console.warn("Screen wake lock could not be enabled.", error);
    wakeLockSentinel = null;
    return false;
  }
}

export async function releaseWakeLock() {
  wakeLockWanted = false;

  if (!wakeLockSentinel) {
    return;
  }

  try {
    await wakeLockSentinel.release();
  } catch (error) {
    console.warn("Screen wake lock could not be released.", error);
  } finally {
    wakeLockSentinel = null;
  }
}

export function setupWakeLockAutoRestore() {
  if (autoRestoreInitialized) {
    return;
  }

  autoRestoreInitialized = true;

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && wakeLockWanted) {
      requestWakeLock();
    }
  });
}