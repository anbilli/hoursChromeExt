// Called when the user clicks on the browser action
// chrome.browserAction.onClicked.addListener(function(tab) {
	// Send a message to the active tab
	// chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		// var activeTab = tabs[0];
		// chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"});
	// });
// });

// Retrieves message from content.js
chrome.runtime.onMessage.addListener(function (request, sender) {
  // First, validate the message's structure
  if ((request.from === 'content') && (request.subject === 'showPageAction')) {
    // Enable the page-action for the requesting tab
    chrome.pageAction.show(sender.tab.id);
	console.log("###############################################here in background");
  }
});

// chrome.runtime.onMessage.addListener(
	// function(request, sender, sendResponse) {
		// document.getElementById("weirdest_cat_ever").innerHTML = request.endTime;
		// console.log("in background");
	// }
// );