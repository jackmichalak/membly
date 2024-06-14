const SEARCH_URL = "http://localhost:3002"

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    console.log(`Page loaded: ${tab.url}`);
  }
});

browser.browserAction.onClicked.addListener(() => {
  browser.tabs.create({ url: SEARCH_URL });
});

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.html) {
    if (message.url.startsWith(SEARCH_URL)) {
      return
    }
    fetch('http://localhost:3001/api/browse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ html: message.html, url: message.url })
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }
});
