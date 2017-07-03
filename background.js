// Retrieves message from content.js
chrome.runtime.onMessage.addListener(function (request, sender) {
  // First, validate the message's structure
  if ((request.from === 'content') && (request.subject === 'showPageAction')) {
    // Enable the page-action for the requesting tab
    chrome.pageAction.show(sender.tab.id);
  }
});
