export const getFormattedTime = (date) =>
    date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
    });

export const getFormattedDate = (date) =>
    date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        // year: 'numeric',
        weekday: 'short',
    }).replace(/(\w+), (\d+) (\w+) (\d+)/, '$2 $3 $4, $1');

export const getFormattedAlarmTime = (alarmTime) =>
    alarmTime.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
    });

export const requestWakeLock = async (wakeLockRef, handleVisibilityChange) => {
    try {
        if ('wakeLock' in navigator) {
            wakeLockRef.current = await navigator.wakeLock.request('screen');
            console.log('Wake Lock activated');

            wakeLockRef.current.addEventListener('release', () => {
                console.log('Wake Lock released');
            });

            document.addEventListener('visibilitychange', handleVisibilityChange);
        } else {
            console.log('Wake Lock API not supported');
        }
    } catch (err) {
        console.error(`Wake Lock Error: ${err.name}, ${err.message}`);
    }
};

export const releaseWakeLock = async (wakeLockRef, handleVisibilityChange) => {
    if (wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
    }
    document.removeEventListener('visibilitychange', handleVisibilityChange);
};

// Utility to detect mobile or tablet
// const isTouchDevice = () => {
//     return (
//       'ontouchstart' in window ||
//       navigator.maxTouchPoints > 0 ||
//       navigator.msMaxTouchPoints > 0
//     );
//   };
  
//   const isMobileOrTablet = () => {
//     const ua = navigator.userAgent;
//     return (
//       /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) ||
//       isTouchDevice()
//     );
//   };
  
//   // Exported fullscreen function
//   export const requestFullScreen = () => {
//     const el = document.documentElement;
//     const request =
//       el.requestFullscreen ||
//       el.webkitRequestFullscreen ||
//       el.mozRequestFullScreen ||
//       el.msRequestFullscreen;
  
//     if (request && isMobileOrTablet() && !document.fullscreenElement) {
//       request.call(el).catch((err) => {
//         console.warn('Fullscreen error:', err.message);
//       });
//     }
//   };
  