// Insert results from content into popup DOM
function setDOMInfo(data) {
	var startTime = data["startTime"];
	var lunchStart = data["lunchStart"];
	var lunchEnd = data["lunchEnd"];
	
	// Lunch taken
	if (lunchStart != null && lunchEnd != null) {
		document.getElementById('lunchTime').style.display = 'none';

		// Convert times to minutes
		startTime = parseMinutes(startTime);
		lunchStart = parseMinutes(lunchStart);
		lunchEnd = parseMinutes(lunchEnd);		
	}
	// Lunch not taken
	else {
		document.getElementById('lunchTime').style.display = 'block';

		// Convert times to minutes
		startTime = parseMinutes(startTime);
		lunchStart = parseMinutes("12:00");
		lunchEnd = parseMinutes("13:00");
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

// Input: "hh:mm", string
// Output: minutes, int
function parseMinutes(time) {
	var hours = parseInt(time.slice(0, time.indexOf(":")));
	var minutes = parseInt(time.slice(time.indexOf(":") + 1));
	return (60 * hours + minutes);
}

function toHours(time) {
	return Math.floor(time / 60);
}

function toMinutes(time) {
	return ("0" + time % 60).slice(-2);
}

function calcEndTime(start, lunch1, lunch2) {
	return start + (8 * 60) + (lunch2 - lunch1);
}

// Validates time input field
function validateInput(id) {
	document.getElementById(id).onkeypress = 
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

// Validate all input fields and update endTime
$(function() {		
	validateInput("workHours");
	validateInput("workMinutes");
	validateInput("lunchHours");
	validateInput("lunchMinutes");
	
	updateEndTime("workHours");
	updateEndTime("workMinutes");
	updateEndTime("lunchHours");
	updateEndTime("lunchMinutes");
});

// Adjust endTime according to work and lunch times
function updateEndTime(id) {
	document.getElementById(id).onchange =
		function() {
			var startTime = parseInt(document.getElementById("startTime").innerHTML);
			var workHr = document.getElementById("workHours");
			var workMins = document.getElementById("workMinutes");
			var lunchHr = document.getElementById("lunchHours");
			var lunchMins = document.getElementById("lunchMinutes");

			// Adjust maximums
			if (id == "workHours") {				
				// Adjust workMinutes max
				if (workHr.value >= workHr.max) {
					workMins.max = 60 - startTime % 60 - 1;
					
					if (workMins.value > workMins.max) {
						workMins.value = workMins.max;						
					}
				}
				else {
					workMins.max = 59;
				}
				
				// Adjust lunch time max
				// Hour max
				lunchHr.max = 24 - parseInt(workHr.value) 
					- Math.ceil((startTime + parseFloat(workMins.value)) / 60);
				// console.log(startTime + " " + workMins.value + " " +(startTime + parseFloat(workMins.value)) / 60);
				if (lunchHr.value > lunchHr.max) {
					lunchHr.value = lunchHr.max;
				}
				
				// Minute max
				var total = 24 - parseInt(workHr.value) - parseInt(lunchHr.value) - startTime/60
				if (total <= 1) {
					lunchMins.max = 60 - (startTime % 60) - (parseInt(workMins.value) % 60) - 1;
				}
				else {
					lunchMins.max = 59;
				}
				
				if (lunchMins.value > lunchMins.max) {
					lunchMins.value = lunchMins.max;
				}
			}
			else if (id == "workMinutes" || id == "lunchHours") {
				// Hour max
				lunchHr.max = 24 - parseInt(workHr.value) 
					- Math.ceil((startTime + parseFloat(workMins.value)) / 60);
				if (lunchHr.value > lunchHr.max) {
					console.log("reset");
					lunchHr.value = lunchHr.max;
				}
				
				// Minutes max
				var total = 24 - parseInt(workHr.value) - parseInt(lunchHr.value) - startTime/60
				if ( total <= 1) {
					lunchMins.max = 60 - startTime % 60 - workMins.value % 60 - 1;
					
					if (lunchMins.value > lunchMins.max) {
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
			document.getElementById("endHour").innerHTML = toHours(endTime);
			document.getElementById("endMin").innerHTML = toMinutes(endTime);
		}
}

// account for lunch break
// error if endtime is 23;59 -> cant work into next day
// comment if hour input > max-2 (10pm) : yeah right, youll be in bed watching netflix
// comment if lunch is 0: okay, lunch skipper. you can always just order pizza: <jets number>
