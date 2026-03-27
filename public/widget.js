(function() {
  // Get the script element to extract the API key
  const script = document.currentScript || (function() {
    const scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  const scriptUrl = new URL(script.src);
  const apiKey = scriptUrl.searchParams.get('key');

  if (!apiKey) {
    console.error('AnyChat: API Key is missing in the script tag.');
    return;
  }

  // Create the iframe container
  const container = document.createElement('div');
  container.id = 'anychat-widget-container';
  container.style.position = 'fixed';
  container.style.bottom = '20px';
  container.style.right = '20px';
  container.style.zIndex = '999999';
  container.style.width = '80px';
  container.style.height = '80px';
  container.style.transition = 'all 0.3s ease';

  // Create the iframe
  const iframe = document.createElement('iframe');
  const baseUrl = scriptUrl.origin;
  iframe.src = `${baseUrl}/widget?key=${apiKey}`;
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  iframe.style.borderRadius = '24px';
  iframe.style.background = 'transparent';
  iframe.style.colorScheme = 'light';
  iframe.setAttribute('allow', 'clipboard-read; clipboard-write');

  container.appendChild(iframe);
  document.body.appendChild(container);

  // Listen for messages from the widget to resize the container
  window.addEventListener('message', function(event) {
    if (event.origin !== baseUrl) return;

    if (event.data.type === 'anychat-toggle') {
      if (event.data.isOpen) {
        container.style.width = '420px';
        container.style.height = '620px';
      } else {
        container.style.width = '80px';
        container.style.height = '80px';
      }
    }
  });
})();
