// Insert results from content into popup DOM
function setDOMInfo(data) {
	document.getElementById('endTime').textContent = data["endTime"];
	var luncher = data["luncher"];

	if (luncher) {
		// Hide lunch input if lunch already taken
		document.getElementById('lunchTime').style.display = 'none';
	}
	else {
		// Show lunch input if lunch not taken
		document.getElementById('lunchTime').style.display = 'block';

	}
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

// If 

// Assign hours max = 24 - start time (12am)

// comment if hour input > max-2 (10pm) : yeah right, youll be in bed watching netflix
// comment if lunch is 0: okay, lunch skipper. you can always just order pizza: <jets number>
// 
