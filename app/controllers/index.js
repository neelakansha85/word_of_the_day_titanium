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

/*
var demo1 = Alloy.Collections.demo1;
var data = Alloy.createModel('demo1', {user_word: '', last_check:'', count:'0'});
demo1.add(data);
data.save();
*/

var db = Ti.Database.open('wordDB');
db.execute('CREATE TABLE IF NOT EXISTS word(id INTEGER PRIMARY KEY, user_word TEXT, last_check TEXT, count INTEGER);');
db.execute('INSERT INTO word(id, user_word, count) values(?, ?, ?)', 1, '', 0);
db.close();

function saveWord(e) {
    user_word = $.word_txt.value;
    var db = Ti.Database.open('wordDB');
    db.execute('UPDATE word SET user_word = ? WHERE id = ?', user_word, 1);
    db.close();
    
    /*
    data.set('user_word', user_word);
    data.save();
    //demo1.fetch();
    */
    
    Ti.API.info("Inside saveWord()");
    Ti.API.info("user_word: " + user_word);
  
    checkWordofDay();
    Ti.API.info("END of saveWord()");
}

function checkWordofDay() {
	Ti.API.info("Inside checkWordofDay()");
	
	var db = Ti.Database.open('wordDB');
	var wordRS = db.execute('SELECT user_word, last_check, count FROM word WHERE id = 1');
	while(wordRS.isValidRow()) {
		var user_word = wordRS.fieldByName('user_word');
		var last_check = wordRS.fieldByName('last_check');
		var count = wordRS.fieldByName('count');
	}
	wordRS.close();
	db.close();
	
	/*
	var user_word = data.get('user_word');
	var last_check = data.get('last_check');
	var count = data.get('count');
	*/
	
	//Debug values
	Ti.API.info("Controller fetched data");
	Ti.API.info("user_word: " + user_word);
	Ti.API.info("last_check: " + last_check);
	Ti.API.info("count: " + count);
	
	var today = new Date();
	var d = today.getDate();
	var m = today.getMonth() + 1;
	var yyyy = today.getFullYear();
	var current_date = yyyy + "-" + m + "-" + d;
	Ti.API.info("Current Date: " + current_date);
	Ti.API.info("Just before last_check: " + last_check);
	
	// Testing purpose disabling check
//	if (last_check != current_date) {
		
	if (count<10) {	
		var url = 'http://api.wordnik.com:80/v4/words.json/wordOfTheDay?date=' + current_date + '&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5';
		var db = Ti.Database.open('wordDB');
		var last_check = db.execute('UPDATE word SET last_check = ? WHERE id = ?', current_date, 1);
		var wordRS = db.execute('SELECT count FROM word WHERE id = 1');
		while(wordRS.isValidRow()) {
			var count = wordRS.fieldByName('count');
		}
		wordRS.close();
		db.close();
		
		/*
		data.set('last_check', current_date);
		data.save();
		*/
		Ti.API.info("last_check: " + last_check);
			
		var json, word_of_day = '';
		Ti.API.info("Before JSON API: word_of_day: " + word_of_day);
		
		var xhr = Ti.Network.createHTTPClient({
			onload: function(e) {
				Ti.API.info('onload called, HTTP status = '+this.status);
				
				json = JSON.parse(this.responseText);
				word_of_day = json.word;
				Ti.API.info("API word_of_day: " + word_of_day);
		
				if(user_word == word_of_day) {
					
					var db = Ti.Database.open('wordDB');
					var wordRS = db.execute('SELECT count FROM word WHERE id = 1');
					while(wordRS.isValidRow()) {
						var count = wordRS.fieldByName('count');
					}
					wordRS.close();
					db.close();
					count++;
					if (isiOS) {
						var notification = Ti.App.iOS.scheduleLocalNotification ({
							badge: count
						});
					}
					else if (isAndroid) {
						var notification = Titanium.Android.createNotification({
							number: count,
							when: new Date()
						});
					}			
					Ti.Media.vibrate([0, 500]);					
					alert("Congratulations your word was the Word of the Day for " + count + " times!");
					var db = Ti.Database.open('wordDB');
					var count = db.execute('UPDATE word SET count = ? WHERE id = ?', count, 1);
					db.close();
				}
			},
			onerror: function(e) {
				Ti.App.fireEvent('get_word_of_day_request', {'error': 'Network Error!!!!!'}); 
			    Ti.API.info("ERROR:  " + e.error);
			    alert('There was an error retrieving the remote data. Try again.');
		    },
		    timeout:5000
		});
		xhr.open("GET", url, false);
		xhr.send();
		Ti.API.info("After JSON API: word_of_day: " + word_of_day);
	}
	Ti.API.info("END of checkWordofDay()");
}

//demo1.fetch();

$.index.open();
