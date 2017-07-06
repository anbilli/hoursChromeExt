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

// Insert results from content into popup DOM
function setDOMInfo(data) {
	var startTime = data["startTime"];
	var lunchStart = data["lunchStart"];
	var lunchEnd = data["lunchEnd"];
	
	// No scans
	if (startTime == null) {
		return;
	}
	// Lunch taken
	else if (lunchStart != null && lunchEnd != null) {
		document.getElementById('lunchTime').style.display = 'none';

		// Convert times to minutes
		startTime = parseMinutes(startTime);
		lunchStart = parseMinutes(lunchStart);
		lunchEnd = parseMinutes(lunchEnd);
		document.getElementById("lunchLength").innerHTML = lunchEnd - lunchStart;
		document.getElementById("lunchMessage").style.display = "block";
		
	}
	// Lunch not taken
	else {
		document.getElementById('lunchTime').style.display = "block";

		// Convert times to minutes
		startTime = parseMinutes(startTime);
		lunchStart = parseMinutes("12:00 PM");
		lunchEnd = parseMinutes("01:00 PM");
	}
	
	// Calculate end time for 8 hour day
	var endTime = calcEndTime(startTime, lunchStart, lunchEnd);
	
	// Insert result into DOM
	document.getElementById("endHour").innerHTML = toHours(endTime);
	document.getElementById("endMin").innerHTML = toMinutes(endTime); 
	document.getElementById("endTime").style.display = 'inline-block';
	document.getElementById("startTime").innerHTML = startTime;
	
	// Adjust max workHours
	document.getElementById("workHours").max = 24 - Math.ceil(startTime/60);
	run();
}

// Validate all input fields and update endTime
function run() {
	$(function() {
		if (document.getElementById("lunchTime").style.display == "block") {
			validateInput("lunchHours");
			validateInput("lunchMinutes");
			
			updateEndTimeWithLunch("lunchHours");
			updateEndTimeWithLunch("lunchMinutes");
			updateEndTimeWithLunch("workHours");
			updateEndTimeWithLunch("workMinutes");
		}
		else {
			updateEndTimeNoLunch("workHours");
			updateEndTimeNoLunch("workMinutes");
		}

		validateInput("workHours");
		validateInput("workMinutes");
	});
}

// Adjust endTime according to work time only
function updateEndTimeNoLunch(id) {
	document.getElementById(id).onchange = 
		function() {
			var startTime = parseInt(document.getElementById("startTime").innerHTML);
			var workHours = parseInt(document.getElementById("workHours").value);
			var lunchLength = parseInt(document.getElementById("lunchLength").innerHTML);
			
			// Check for empty entries
			isEmpty("workHours");
			isEmpty("workMinutes");
			
			if (id == "workHours") {
				var total = 24 * 60 - (startTime + workHours * 60 + lunchLength);
				var workMins = document.getElementById("workMinutes");
			
				if (total <= 60) {
					workMins.max = total - 1;
					
					if (parseInt(workMins.value) > parseInt(workMins.max)) {
						workMins.value = workMins.max;
					}
				}
				else {
					workMins.max = 59;
				}
			}
			
			var workMinutes = parseInt(document.getElementById("workMinutes").value);
			var endTime = startTime + (workHours * 60 + workMinutes) + lunchLength;
			var endHours = toHours(endTime);
			var endMins = toMinutes(endTime);

			setEndTime(endHours, endMins);
		}
}

// Adjust endTime according to work and lunch times
function updateEndTimeWithLunch(id) {
	document.getElementById(id).onchange =
		function() {
			var startTime = parseInt(document.getElementById("startTime").innerHTML);
			var workHr = document.getElementById("workHours");
			var workMins = document.getElementById("workMinutes");
			var lunchHr = document.getElementById("lunchHours");
			var lunchMins = document.getElementById("lunchMinutes");
			
			// Check for empty entries
			isEmpty("lunchHours");
			isEmpty("lunchMinutes");
			isEmpty("workHours");
			isEmpty("workMinutes");
			
			// Adjust maximums
			if (id == "workHours") {				
				// Adjust work minutes max
				if (parseInt(workHr.value) >= parseInt(workHr.max)) {
					workMins.max = 60 - startTime % 60 - 1;
					
					if (parseInt(workMins.value) > parseInt(workMins.max)) {
						workMins.value = workMins.max;						
					}
				}
				else {
					workMins.max = 59;
				}
				
				// Lunch hour max
				lunchHr.max = 24 - parseInt(workHr.value) 
					- Math.ceil((startTime + parseFloat(workMins.value)) / 60);

				if (parseInt(lunchHr.value) > parseInt(lunchHr.max)) {
					lunchHr.value = lunchHr.max;
				}
				
				// Lunch minute max
				var total = 24 * 60 - (startTime + parseInt(workHr.value) * 60 + parseInt(workMins.value)
					+ parseInt(lunchHr.value) * 60);

				if (total <= 60) {
					lunchMins.max = total - 1;
				
					if (parseInt(lunchMins.value) > parseInt(lunchMins.max)) {
						lunchMins.value = lunchMins.max;
					}
				}
				else {
					lunchMins.max = 59;
				}
				

			}
			else if (id == "workMinutes" || id == "lunchHours") {
				if (id == "workMinutes") {
					// Lunch hour max
					lunchHr.max = 24 - parseInt(workHr.value) 
						- Math.ceil((startTime + parseFloat(workMins.value)) / 60);
					if (parseInt(lunchHr.value) > parseInt(lunchHr.max)) {
						lunchHr.value = lunchHr.max;
					}
				}
				// Lunch minutes max
				var total = 24 * 60 - (startTime + parseInt(workHr.value) * 60 + parseInt(workMins.value)
					+ parseInt(lunchHr.value) * 60);
					console.log("mins " + parseInt(workMins.value)/60);
				if (total <= 60) {
					lunchMins.max = total - 1;
					
					if (parseInt(lunchMins.value) > parseInt(lunchMins.max)) {
						lunchMins.value = lunchMins.max;
					}
				}
				else {
					lunchMins.max = 59;
				}
			}
			
			var workHours = parseInt(workHr.value);
			var workMinutes = parseInt(workMins.value);
			var lunchHours = parseInt(lunchHr.value);
			var lunchMins = parseInt(lunchMins.value);			
			var endTime = startTime + (workHours * 60 + workMinutes) + (lunchHours * 60 + lunchMins);
			var endHours = toHours(endTime);
			var endMins = toMinutes(endTime);

			setEndTime(endHours, endMins);
		}
}

// Validates time input field
function validateInput(id) {
	var object = document.getElementById(id);
	object.onkeypress = 
		function(e) {
			var ev = e || window.event;
			
			if (ev.charCode < 48 || ev.charCode > 57) {
				return false;
			}
			else if (this.value * 10 + ev.charCode - 48 > this.max) {
				return false;
			}
			else {
				return true;
			}
			
		}
}

// Replaces empty entries with 0
function isEmpty(id) {
	object = document.getElementById(id);
	console.log("before " + object.value);
	if (object.value.length == 0) {
		object.value = 0;
	}
	console.log("after " + object.value);
}

// Check for maxed out endTime
function setEndTime(endHours, endMins) {
	document.getElementById("endHour").innerHTML = endHours;
	document.getElementById("endMin").innerHTML = endMins;
	
	if (endHours == 23 && endMins == 59) {
		document.getElementById("errors").style.display = "inline-block";
	}
	else {
		document.getElementById("errors").style.display = "none";
	}
}

// Input: "hh:mm", string
// Output: minutes, int
function parseMinutes(time) {
	var hours = parseInt(time.slice(0, time.indexOf(":")));
	var minutes = parseInt(time.slice(time.indexOf(":") + 1));
	var period = time.slice(time.indexOf(":") + 4);
	
	if (period == "AM" || hours == 12) {
		return (60 * hours + minutes);
	}
	else {
		return (60 * (hours + 12) + minutes);
	}
}

// Input: minutes, int
// Output: hours, int
function toHours(time) {
	return Math.floor(time / 60);
}

// Input: minutes > 60, int
// Output: minutes % 60, int
function toMinutes(time) {
	return ("0" + time % 60).slice(-2);
}

// Input: minutes, int
// Output: minutes, int
function calcEndTime(start, lunch1, lunch2) {
	return start + (8 * 60) + (lunch2 - lunch1);
}
