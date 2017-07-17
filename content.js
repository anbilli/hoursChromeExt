// Inform the background page that 
// this tab should have a page-action
chrome.runtime.sendMessage({
  from:    'content',
  subject: 'showPageAction'
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if( request.from === 'popup' && request.subject === 'DOMInfo' ) {
			
			// Grab page elements
			var tbody = document.getElementById("divActivities").children[0].children[0];
			var scans = tbody.children.length;
			
			// Parse times
			var startTime = null,
				lunchStart = null,
				lunchEnd = null;
			
			if (scans > 0) {
				var trow1 = tbody.children[0].innerHTML;
				startTime = parseTime(trow1);	
			}
			if (scans > 2) {
				var trow2 = tbody.children[1].innerHTML;
				var trow3 = tbody.children[2].innerHTML;

				lunchStart = parseTime(trow2);
				lunchEnd = parseTime(trow3);
			}
		
			// Convert results to JSON
			var results = {
				startTime: startTime,
				lunchStart: lunchStart,
				lunchEnd: lunchEnd
			};
			
			// Return results to extension	
			sendResponse(results);
		}
});

// Parses time from row content
function parseTime(input) {
	return input.substring(input.indexOf(':')-2, input.indexOf(':')+6);
}
