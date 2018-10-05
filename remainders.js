var Cloudant = require('cloudant');
var username = '670c7140-2118-4b76-ab85-9cb7899af063-bluemix';
var password = '8ccbc6a4e9238683ae3a027230328a3528bfddc';
var cloudant = Cloudant({url:"https://670c7140-2118-4b76-ab85-9cb7899af063-bluemix:8ccbc6a4e9238683ae3a027230328a3528bfddcad0eedaae69de6e6b8631f293@670c7140-2118-4b76-ab85-9cb7899af063-bluemix.cloudant.com"});
var sample =[];
var sample1;
var db = cloudant.db.use("policy_details");
module.exports =function(params,callback){
function user() {
	console.log(params)
		return new Promise(function (resolve, reject) {
			var query = {
				"selector": {
					"_id": {
						"$gt": "0"
					}
				},
				"fields": [
					"expiryDate"
				]
			}
			db.find(query, function (err, result) {
				if (err) {
					console.log(err);
					throw err;
					reject(err);
				}
				else {
					for (var i = 0; i < result.docs.length; i++) {
						var date1 = new Date(result.docs[i].expiryDate)
						var date2 = new Date();
						console.log("============================ inputs ====================")
						console.log(date1);
						console.log(date2);
						var timeDiff = Math.abs(date1.getTime() - date2.getTime());
						var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
						console.log(diffDays)
						if (diffDays >= 10) {
							sample.push(result.docs[i].expiryDate);

						}

					}
					resolve(sample)
				}

			});
		});
	}
	function user1(args) {
		for (var i = 0; i < args.length; i++) {
			var query1 = {
				"selector": {
					"expiryDate": {
						"$eq": args[i]
					}
				},
				"fields": [
					"phNumber"
				]
			}
			db.find(query1, function (err, result) {
				if (err) {
					console.log(err)
					callback(null,err);
				}
				else {
					console.log("+++++++++++++++++++++ Hars")
					console.log(result);
					sample1= result;
					//sample1.push(result);
/* 					console.log(result.docs[0].phNumber.split("+91")[1]);
					console.log(i);
					sample1.push(result.docs[0].phNumber.split("+91")[1]); */

				}
				
			});
		}
		callback(sample1)
		
	}
	user().then(function (data) {
		user1(data);
	});
}