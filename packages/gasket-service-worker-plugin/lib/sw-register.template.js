if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('{URL}',
      { scope: '{SCOPE}' }).then(function (registration) {
      console.log('SW registered: ', registration);
    }).catch(function (registrationError) {
      console.warn('SW registration failed: ', registrationError);
    });
  });
}
