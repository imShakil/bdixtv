'use client';

import { useEffect } from 'react';

export default function ConsentBanner() {
  useEffect(() => {
    // Load Google Funding Choices (CMP)
    const script = document.createElement('script');
    script.src = 'https://fundingchoicesmessages.google.com/i/pub-2449944472030683?ers=1';
    script.async = true;
    script.nonce = 'funding-choices';
    document.head.appendChild(script);

    // Configure Funding Choices
    const configScript = document.createElement('script');
    configScript.nonce = 'funding-choices';
    configScript.text = `(function() {function signalGooglefcPresent() {if (!window.frames['googlefcPresent']) {if (document.body) {const iframe = document.createElement('iframe'); iframe.style = 'width: 0; height: 0; border: none; z-index: -1000; left: -1000px; top: -1000px;'; iframe.style.display = 'none'; iframe.name = 'googlefcPresent'; document.body.appendChild(iframe);} else {setTimeout(signalGooglefcPresent, 0);}}}signalGooglefcPresent();})();`;
    document.head.appendChild(configScript);

    return () => {
      document.head.removeChild(script);
      document.head.removeChild(configScript);
    };
  }, []);

  return null;
}
