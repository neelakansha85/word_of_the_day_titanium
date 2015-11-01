exports.begin = function() {
	var osname = Ti.Platform.name;
	var isAndroid = (osname == 'android') ? true : false;
	var isiOS = ((osname == 'iPhone OS') ? true : false);
	
	// Check if the device is running iOS 8 or later, before registering for local notifications
	if (isiOS && parseInt(Ti.Platform.version.split(".")[0]) >= 8) {
	    Ti.App.iOS.registerUserNotificationSettings({
		    types: [
	            Ti.App.iOS.USER_NOTIFICATION_TYPE_SOUND,
	            Ti.App.iOS.USER_NOTIFICATION_TYPE_BADGE
	        ]
	    });
	}

	var data = Alloy.createModel('demo1', {user_word: '', last_check:'', count:'0'});
	data.set('user_word', 'contestant');
	var new_word = data.get('user_word');
	Ti.API.info("New Word set from Controller: " + new_word);
	
	checkWordofDay();

};

function saveWord(e) {
    var data = Alloy.createModel('demo1', {user_word: '', last_check:'', count:'0'});
    user_word = $.word_txt.value;
    data.set('user_word', user_word);
    
    Ti.API.info("Inside saveWord()");
    Ti.API.info("user_word: " + user_word);
  
    checkWordofDay();
    Ti.API.info("END of saveWord()");
}

function checkWordofDay() {
	Ti.API.info("Inside checkWordofDay()");
	var data = Alloy.createModel('demo1', {user_word: '', last_check:'', count:'0'});
	var user_word = data.get('user_word');
	var last_check = data.get('last_check');
	var count = data.get('count');
	
	//Debug values
	Ti.API.info("Controller fetched data");
	Ti.API.info("user_word: " + user_word);
	Ti.API.info("last_check: " + last_check);
	Ti.API.info("count: " + count);
	
	var today = new Date();
	var d = today.getDate();
	var m = today.getMonth();
	var yyyy = today.getFullYear();
	var current_date = yyyy + "-" + m + "-" + d;
	Ti.API.info("Current Date: " + current_date);
	Ti.API.info("Just before last_check: " + last_check);
	
	// Testing purpose disabling check
	if (last_check == current_date && count < 10) {
		var api_url = 'http://api.wordnik.com:80/v4/words.json/wordOfTheDay?date=' + current_date + '&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5';
		var word_of_day = 'freedom';
		data.set('last_check', current_date);
		Ti.API.info("last_check: " + data.get('last_check'));
		
		if(user_word == word_of_day) {
			count++;
			if (isiOS) {
				var notification = Ti.App.iOS.scheduleLocalNotification ({
					badge: count,
					sound: "/alert.wav"
				});
			}
			else if (isAndroid) {
				var notification = Titanium.Android.createNotification({
					contentTitle: 'Word of the Day',
					contentText: 'Congratulations your word was the Word of the Day!',
					number: count,
					when: new Date()
				});
			}
			
			Ti.Media.vibrate([0, 500]);
			
			alert("Congratulations your word was the Word of the Day for " + count + " times!");
		}
	}
	Ti.API.info("END of checkWordofDay()");
}

$.index.open();
