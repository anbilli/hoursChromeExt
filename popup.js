// Insert results from content into popup DOM
function setDOMInfo(data) {
	document.getElementById('endTime').textContent = data["endTime"];
}

// Execute on page load
window.addEventListener('DOMContentLoaded', function () {
	// Query for the active tab
	chrome.tabs.query({
			active: true,
			currentWindow: true
		}, function (tabs) {
			// Send a request for the DOM info
			chrome.tabs.sendMessage(
				tabs[0].id,
				{from: 'popup', subject: 'DOMInfo'},
				// Specifies a callback to be called 
				//    from the receiving end (content script)
				setDOMInfo);
	});
});

// Validate minutes input
$(function() {
	$('#workMinutes').bind('keypress', function(event){
		console.log("keycode+++++++++");
		if(event.keyCode < 48 || event.keyCode > 57) {
			return false;
		}
		else if(event.val() > this.max) {
			return false;
		}
		else {
			return true;
		}
	});
});