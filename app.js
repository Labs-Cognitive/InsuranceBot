var express = require('express');
var app = express();
const accountSid = 'AC236223461d71ef977cb05ebefc75ee5f';
const authToken = '4b7cc1bcaad03331798908de1f1e312d';
const client = require('twilio')(accountSid, authToken);
//var jwt=require('jsonwebtoken-refresh');
var store = require('store');
var bodyParser = require('body-parser');
var watson = require('watson-developer-cloud');
var Promise = require('promise');
var unirest = require('unirest');
const jwt = require('jsonwebtoken-refresh');
const stringifyObject = require('stringify-object');
var NODE_TLS_REJECT_UNAUTHORIZED = 0
var Cloudant = require('cloudant');
var username = '670c7140-2118-4b76-ab85-9cb7899af063-bluemix';
var password = '8ccbc6a4e9238683ae3a027230328a3528bfddc';
var cloudant = Cloudant({ url: "https://670c7140-2118-4b76-ab85-9cb7899af063-bluemix:8ccbc6a4e9238683ae3a027230328a3528bfddcad0eedaae69de6e6b8631f293@670c7140-2118-4b76-ab85-9cb7899af063-bluemix.cloudant.com" });
var details;
var claims = cloudant.db.use('claims');
const claimExpiry = require("./claim.js");
const claimStatus = require("./claimStatus.js");
const VINDetails = require("./VIN.js");
const policyExpiry = require("./policyExpiry.js");
const policyStatus = require("./policyStatus.js");
const otpRequest = require("./otpRequest.js");
const otpCheck = require("./otpCheck.js");
const recordCheck = require("./checking.js");
const salesForce = require("./salesforce.js");
var userdetails = require("./userdetails.js")
var mail = require('./send_mail.js');
var mail1 = require('./sendmail1.js');
var mail2 = require('./send_mail2.js');
var renew = require('./renewpolicy.js');
var renew_no = require('./renew_no.js');
var remainders = require('./remainders.js');
var db = cloudant.db.use("policy_details");
var smtpTransport = require('nodemailer-smtp-transport');
var nodemailer = require('nodemailer');
var sample = [];
app.use(bodyParser.urlencoded({ entended: false }));
var assistant = new watson.AssistantV1({
	username: '8f5f0d9d-c993-4682-9ae5-9c6fcb74ec7b',
	password: '31gkWErRrFWz',
	version: '2018-07-10'
});
var context1 = {};
var zip;
var msg;
var pNumber;
app.get('/test', function (req, res) {
})
app.post('/api', function (req, res) {
	console.log("Request Object");
	var From = req.body.From;
	console.log(From);
	assistant.message({
		workspace_id: '09dbb86a-4bc6-4545-b247-6d9ac02aa69b',
		input: { 'text': req.body.Body },
		context: context1
	}, function (err, response) {
		if (err)
			console.log('error:', err);
		else {
			console.log("Inside else");
			console.log("Response", response);
			console.log(response.output.text[0]);
			console.log(JSON.parse(response.output.text[0]).action);
			console.log(JSON.parse(response.output.text[0]).data);
			console.log('End of Inside else');

			if (JSON.parse(response.output.text[0]).action == "forward") {
				context1 = response.context;
				
				var msg = JSON.parse(response.output.text[0]).message;
				console.log("message", msg);
				client.messages
					.create({
						body: msg,
						from: 'whatsapp:+14155238886',
						to: From
					})
					.then(message => console.log(msg))
					.done();



			}
			if (JSON.parse(response.output.text[0]).action == "process" && JSON.parse(response.output.text[0]).data == "otp") {
				context1 = response.context;
				console.log(store.get("jwtToken"));
				console.log("After JWT Token");
				jwt.verify(store.get("jwtToken"), 'secret', function (err, decoded) {
					console.log()
					if (err) {
						console.log('no session');
						otpRequest.test({ phoneNo: From }, function (otpResponse) {
							console.log(otpResponse);
							console.log(From);
							store.set(From, otpResponse.resData.requestId);
							store.set('response', response);
							console.log(otpResponse);
							if (otpResponse.resData.result == "success") {
								var msg = "You will get a verification code to **" + From.toString().slice(-4) + ". Please enter the code to process the functionality";
								client.messages
									.create({
										body: msg,
										from: 'whatsapp:+14155238886',
										to: From
									})
									.then(message => console.log("Success"))
									.done();
							}
						});
					} else {
						jwt.refresh(decoded, 5 * 60, 'secret', (err, refreshToken) => {
							if (err) {
								console.log('error in refresh token');
							} else {
								store.set('jwtToken', refreshToken);

								//do something here
								console.log('this is response');
								if (JSON.parse(response.output.text[0]).status == "downloadPolicy") {

									policyStatusFunction();
								}
								if (JSON.parse(response.output.text[0]).status == "policy_status") {

									policyCheckFunction();

								}
								if (JSON.parse(response.output.text[0]).status == "claim_status") {
									claimCheckFunction();
									//response.context.claimnumber = "";
								}
								if (JSON.parse(response.output.text[0]).status == "renew_status") {
									renewStatusCheck();
								}
							}
						});
					}
				});

			}
			if (JSON.parse(response.output.text[0]).action = "process" && JSON.parse(response.output.text[0]).data == "otpcheck") {

				// context1 = response.context;
				console.log(store.get(From));
				otpCheck.otpCheck({ requestId: store.get(From), pin: JSON.parse(response.output.text[0]).pin }, function (data) {
					console.log(JSON.stringify(data))
					if (JSON.parse(JSON.stringify(data)).resData == 0) {
						store.set('jwtToken', jwt.sign({ data: 'BankingBot' }, 'secret', { expiresIn: 5 * 60 }));
						var response = store.get('response');
						console.log(response);
						if (JSON.parse(response.output.text[0]).status == "downloadPolicy") {

							policyStatusFunction();
						}
						if (JSON.parse(response.output.text[0]).status == "policy_status") {

							policyCheckFunction();

						}
						if (JSON.parse(response.output.text[0]).status == "claim_status") {
							claimCheckFunction();
							//response.context.claimnumber = "";
						}
						if (JSON.parse(response.output.text[0]).status == "renew_status") {
							renewStatusCheck();
						}
					} else {
						var msg = "Your OTP is not verified";
						client.messages
							.create({
								body: msg,
								from: 'whatsapp:+14155238886',
								to: From
							})
							.then(message => console.log("Success"))
							.done();
					}
				})
			}
			if (JSON.parse(response.output.text[0]).action == "process" && ((JSON.parse(response.output.text[0]).data == "findAgent") || (JSON.parse(response.output.text[0]).data == "zcode"))) {
				console.log(response.context);
				console.log('end of testing');
				console.log(res);
				context1 = response.context;
				zip = response.context.zcode;
				console.log("Zip code", zip);
				unirest.get("https://www.zipcodeapi.com/rest/ZbMVxGouiNt6h9G5AgE77lmu33p62pzmtUHoQsQZNQMCzYGVHgr9rECgIRF3ly3S/info.json/" + zip + "/radians")
					.end(function (response1, error) {
						console.log(JSON.parse(response1.raw_body).error_code);
						if (error) {
							var message = "Error while connecting";
						}
						else if (JSON.parse(response1.raw_body).error_code == 404) {
							assistant.message({
								workspace_id: '09dbb86a-4bc6-4545-b247-6d9ac02aa69b',
								input: { 'text': 'Not valid' },
								context: context1,
								headers: {
									'Custom-Header': 'custom',
									'Accept-Language': 'custom'

								}
							}, function (err, result, response) {
								if (err)
									console.log('error:', err);
								else
									console.log(JSON.stringify(result, null, 2));

								client.messages
									.create({
										body: JSON.parse(result.output.text[0]).message,
										from: 'whatsapp:+14155238886',
										to: From
									})
									.then(message => console.log(JSON.parse(result.output.text[0]).message))
									.done();
							});
						}
						else {
							msg = "Can you confirm that " + response1.body.zip_code + " refers to " + response1.body.city + ", " + response1.body.state + ". *Yes* or *No*";
							console.log("After message");
							client.messages
								.create({
									body: msg,
									from: 'whatsapp:+14155238886',
									to: From
								})
								.then(message => console.log("Success"))
								.done();
						}
					});

			}
			if (JSON.parse(response.output.text[0]).action == "process" && JSON.parse(response.output.text[0]).data == "policies_info") {
				context1 = response.context;
				console.log("INside policy status ")
				console.log('from' + From);
				console.log(response);
				policyStatus.getStatus(response.input.text, function (err, data) {
					console.log(data.docs[0]);
					mail1('insurancebot123@gmail.com', function (response) {
						console.log('we have sent you a message on branch deletion')
					})

					client.messages
						.create({
							body: 'Here are the policy details,\n\n*Policy Number*: ' + data.docs[0].policyNumber + '\n*Policy Type*: ' + data.docs[0].policyType + '\n*Vehicle Identification Number*: ' + data.docs[0].VIN +"\n\nThe policy document has been sent to your email",
							from: 'whatsapp:+14155238886',
							to: From
						})
						.then(message => console.log("Success"))
						.done();
					response.context = {};
					console.log(response.context);
				});

			}
			if (JSON.parse(response.output.text[0]).action == "process" && JSON.parse(response.output.text[0]).data == "address") {
				console.log("Address");
				context1 = response.context;
				zip = response.context.zcode;

				unirest.get("https://www.zipcodeapi.com/rest/ZbMVxGouiNt6h9G5AgE77lmu33p62pzmtUHoQsQZNQMCzYGVHgr9rECgIRF3ly3S/info.json/" + zip + "/radians")
					.end(function (response1, error) {
						if (error) {
							var msg = "Please enter a valid zipcode";
							console.log("After message");
							client.messages
								.create({
									body: msg,
									from: 'whatsapp:+14155238886',
									to: From
								})
								.then(message => console.log("Success"))
								.done();
						}
						else {
							if (response1.body.state == "MI") {
								msg = "I have found 2 offices within 50 miles of " + zip + "\n\n*34405 W. 12 Mile Rd, Suite 130, Farmington Hills, MI 48331* \n*760 W. Eisenhower Pkwy, Ste 100, Ann Arbor, MI 48103* "
							}
							else if (response1.body.state == "WI") {
								msg = "I have found 2 offices near " + zip + " \n\n*125 South Webster St.Madison, WI 53703 \nPO Box 974 Madison, WI 53701* "
							} else {
								msg = "We don't have any agents near by " + zip
							}
							console.log("After message");
							client.messages
								.create({
									body: msg,
									from: 'whatsapp:+14155238886',
									to: From
								})
								.then(message => console.log("Success"))
								.done();
						}
					});

			}


			if (JSON.parse(response.output.text[0]).action == "process" && JSON.parse(response.output.text[0]).data == "pnumber") {
				context1 = response.context;
				pNumber = response.context.pnumber;
				policyExpiry({ policyNumber: pNumber }).then((responseData) => {
					console.log(responseData);
					msg = "Your policy " + pNumber + " is " + responseData.policyState + ". It is going to expire on " + "*" + responseData.expiryDate + "*";
					//msg="Your policy M1234567 is In-force. It is going to expire on 16/02/2019."
					client.messages
						.create({
							body: msg,
							from: 'whatsapp:+14155238886',
							to: From
						})
						.then(message => console.log("Success"))
						.done();


				})



			}

			if (JSON.parse(response.output.text[0]).action == "process" && JSON.parse(response.output.text[0]).data == "claim_number") {
				context1 = response.context;
				cNumber = response.context.claimnumber;
				claimExpiry({ claimNumber: cNumber }).then((responseData) => {
					console.log(responseData);
					msg = " Your claim request is in " + responseData.claimStatus + " state"

					client.messages
						.create({
							body: msg,
							from: 'whatsapp:+14155238886',
							to: From
						})
						.then(message => console.log("Success"))
						.done();


				})

			}
			//new code from pavani g
			if (JSON.parse(response.output.text[0]).action == "process" && JSON.parse(response.output.text[0]).data == "VIN") {
				context1 = response.context;
				VIN = response.context.vin;
				
				//var info;
				
				VINDetails({ "vin": VIN }).then((responseData) => {
					console.log(responseData);
					
					if (responseData.num == 0) {
						msg = "We didn't find any VIN registered with your account"

					}
					else {
					
						userdetails({ "PhoneNumber": From }).then((response_data) => {
							console.log("response", response_data);
							info= response_data;
								console.log("HArshitha")
						console.log(response_data);
						details = {
							FirstName: info.resData.docs[0].fName,
							LastName: info.resData.docs[0].lName,
							Email: response.context.email,
							Product_Type__c: response.context.Insurance,
							Policy_Period__c: response.context.policy_period + " years",
							Model__c: responseData.resData.docs[0].model,
							Make__c: responseData.resData.docs[0].make,
							Model_Year__c: responseData.resData.docs[0].modelYear,
							Manufacturer__c: responseData.resData.docs[0].manufacturer,
							Company: "Miracle Software Systems",
							Phone: responseData.resData.docs[0].phNumber
						};
						
						//msg = 'Thank you for entering all the details. Here are the details that you have entered,\n\n*First Name*: '+info.resData.docs[0].fName+' \n*Last Name*:'+info.resData.docs[0].lName+' \n*Email*: ' + response.context.email + '\n*Product Type*: ' + response.context.Insurance + '\n*Policy Period*: ' + response.context.policy_period + " years" + '\n*Model*: ' + responseData.resData.docs[0].model + ' \n*Make*: ' + responseData.resData.docs[0].make + ' \n*Model Year*: ' + responseData.resData.docs[0].modelYear + '\n*Manufacturer*: ' + responseData.resData.docs[0].manufacturer + '\n\nPlease confirm the above information *Yes* or *No*'
						msg = 'Thank you for entering all the details. Here are the details that you have entered,\n\n*First Name*: '+response_data.resData.docs[0].fName+' \n*Last Name*:'+response_data.resData.docs[0].lName+' \n*Email*: ' + response.context.email + '\n*Product Type*: ' + response.context.Insurance + '\n*Policy Period*: ' + response.context.policy_period + " years" + '\n*Model*: ' + responseData.resData.docs[0].model + ' \n*Make*: ' + responseData.resData.docs[0].make + ' \n*Model Year*: ' + responseData.resData.docs[0].modelYear + '\n*Manufacturer*: ' + responseData.resData.docs[0].manufacturer + '\n\nPlease confirm the above information *Yes* or *No*'
					
					

					client.messages
						.create({
							body: msg,
							from: 'whatsapp:+14155238886',
							to: From
						})
						.then(message => console.log("Success"))
						.done();
				})
			}
		})

			}
			if (JSON.parse(response.output.text[0]).action == "process" && JSON.parse(response.output.text[0]).data == "salesforce") {
				context1 = response.context;
				salesForce().then((responseData) => {
					console.log(responseData);
					if (responseData.error == undefined) {
						unirest.post('https://msssf-dev-ed.my.salesforce.com/services/data/v40.0/sobjects/Lead')
							.headers({ 'Content-Type': 'application/json', 'Accept': 'application/json', "Authorization": "Bearer " + responseData.authToken })
							.send(details)
							.end(function (response) {
								console.log('in Salesforce');
								console.log(response.body);
								if (response.body.success == true) {
									msg = "Your quote will be sent to your mail address";

									mail(details.Email, function (response) {
										console.log('we have sent you a message on branch deletion')
									})


								}
								else {
									msg = "Error in registering the details in sales force"
								}

								client.messages
									.create({
										body: msg,
										from: 'whatsapp:+14155238886',
										to: From
									})
									.then(message => console.log("Success"))
									.done();

							});
					}
					else {
						msg = "Authentication failed for SalesForce Account";
						client.messages
							.create({
								body: msg,
								from: 'whatsapp:+14155238886',
								to: From
							})
							.then(message => console.log("Success"))
							.done();
					}

				})
			}
			if (JSON.parse(response.output.text[0]).action == "process" && JSON.parse(response.output.text[0]).data == "email") {
				context1 = response.context;
				
				mail2(response.context.email, function (response) {
					console.log('we have sent you a message on branch deletion')
				})
				
					msg = "Your quote will be sent to your mail address"

					client.messages
						.create({
							body: msg,
							from: 'whatsapp:+14155238886',
							to: From
						})
						.then(message => console.log("Success"))
						.done();

			}
			if (JSON.parse(response.output.text[0]).action == "process" && JSON.parse(response.output.text[0]).data == "expiry_check") {
				console.log("*******************************************************")
				console.log('testing');
				console.log(response.context);
				console.log('end of testing');
				context1 = response.context;
				var sample1 = response.context;;
				console.log(response.context.policy);
				var sample = response.context.policy
				renew({ "policy": sample }).then((responseData) => {
					console.log("responseData", responseData);
					console.log(responseData.resData.docs[0].expiryDate)

					//console.log(result);
					var date1 = new Date(responseData.resData.docs[0].expiryDate)
					var date2 = new Date();
					console.log("============================ inputs ====================")
					console.log(date1);
					console.log(date2);
					var timeDiff = Math.abs(date1.getTime() - date2.getTime());
					var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
					console.log(diffDays)
					if (diffDays >= 45) {
						console.log("Inside if")
						console.log(" The policy number you have entered expires on " + responseData.resData.docs[0].expiryDate + ". You can only renew it from 45 days prior to the expiry date")
						var msg = "The policy number you have entered expires on " + responseData.resData.docs[0].expiryDate + ". You can only renew it from 45 days prior to the expiry date";
						client.messages
							.create({
								body: msg,
								from: 'whatsapp:+14155238886',
								to: From
							})
							.then(message => console.log("Success"))
							.done();

					}
					else {
						console.log(response.context);
						console.log(sample1)
						assistant.message({
							workspace_id: '09dbb86a-4bc6-4545-b247-6d9ac02aa69b',
							input: { 'text': 'No' },
							context: context1,
							headers: {
								'Custom-Header': 'custom',
								'Accept-Language': 'custom'

							}
						}, function (err, result, response) {
							if (err)
								console.log('error:', err);
							else {
								context1 = result.context;
								console.log(JSON.stringify(result, null, 2));
							}

							client.messages
								.create({
									body: JSON.parse(result.output.text[0]).message,
									from: 'whatsapp:+14155238886',
									to: From
								})
								.then(message => console.log(JSON.parse(result.output.text[0]).message))
								.done();
						});
					}
				})


				//added code


			}
			if (JSON.parse(response.output.text[0]).action == "process" && JSON.parse(response.output.text[0]).data == "get_details") {
				console.log("Inside");
				console.log(response);
				context1 = response.context;
				var sample = response.context.policy
				renew_no({ "policy": sample }).then((responseData) => {
					console.log("responseData", responseData);
					console.log(responseData.resData.docs[0].policyType)
					if (response.context.year == 1) {
						msg = "Here are the policy renewal details,\n\n*Policy Number*: " + responseData.resData.docs[0].policyNumber + "\n*Policy Type*: " + responseData.resData.docs[0].policyType + "\n*Vehicle Identification Number*: " + responseData.resData.docs[0].VIN + "\n*Policy Period*: " + response.context.year + "years\n*Total Premium*: $374\n*Tax*: $3\n*Net Payable Amount*: $376 \n\nDo you like to make the renewal?  *Yes* or *No* ";
						//console.log(responseData.resData.docs[0])
					}
					else if (response.context.year == 2) {
						msg = "Here are the policy renewal details,\n\n*Policy Number*: " + responseData.resData.docs[0].policyNumber + "\n*Policy Type*: " + responseData.resData.docs[0].policyType + "\n*Vehicle Identification Number*: " + responseData.resData.docs[0].VIN + "\n*Policy Period*: " + response.context.year + "years\n*Total Premium*: $739\n*Tax*: $3\n*Net Payable Amount*: $742 \n\nDo you like to make the renewal?  *Yes* or *No* ";

					}
					else if (response.context.year == 3) {
						msg = "Here are the policy renewal details,\n\n*Policy Number*: " + responseData.resData.docs[0].policyNumber + "\n*Policy Type*: " + responseData.resData.docs[0].policyType + "\n*Vehicle Identification Number*: " + responseData.resData.docs[0].VIN + "\n*Policy Period*: " + response.context.year + "years \n*Total Premium*: $987\n*Tax*: $3\n*Net Payable Amount*: $990 \n\nDo you like to make the renewal? *Yes* or *No* ";
					}
					client.messages
						.create({
							body: msg,
							from: 'whatsapp:+14155238886',
							to: From
						})
						.then(message => console.log("Success"))
						.done();



				})

			}

		}

	})
	function claimCheckFunction() {
		claimStatus({ phoneNo: From }).then((responseData) => {
			console.log("responseData", responseData);
			if (responseData.num == 0) {
				msg = "We didn't find any claim registered with your account"

			}
			else if (responseData.num == 1) {
				msg = " Your claim request " + responseData.resData.docs[0].claimNumber + " is in " + responseData.resData.docs[0].claimStatus + " state"
			}
			else if (responseData.num == 2) {
				msg = "I was able to find " + responseData.num + " claims associated with your account. Please select one,\n" + responseData.resData.docs[0].claimNumber + "\n" + responseData.resData.docs[1].claimNumber
			}

			client.messages
				.create({
					body: msg,
					from: 'whatsapp:+14155238886',
					to: From
				})
				.then(message => console.log("Success"))
				.done();

		})
	}

	function policyCheckFunction() {
		policyStatus.getPolicyStatus({ phoneNo: From }, function (responseData) {
			console.log("responseData", JSON.stringify(responseData));
			if (responseData.num == 0) {
				var msg = "We didn't find any policy registered with your account"

			}
			else if (responseData.num == 1) {
				var msg = "Your policy " + responseData.resData.docs[0].policyNumber + " is " + responseData.resData.docs[0].policyState + ". It is going to expire on " + "*" + responseData.resData.docs[0].expiryDate + "*"
			}
			else if (responseData.num == 2) {
				var msg = "We have found " + responseData.num + " policies registered with your account. Please select one,\n" + responseData.resData.docs[0].policyNumber + "\n" + responseData.resData.docs[1].policyNumber + ""

			}
			else if (responseData.num == 3) {
				var msg = "We have found " + responseData.num + " policies registered with your account. Please select one,\n" + responseData.resData.docs[0].policyNumber + "\n" + responseData.resData.docs[1].policyNumber + "\n" + responseData.resData.docs[2].policyNumber

			} else {
				var msg = "We have found " + responseData.num + " policies registered with your account. Which one do you want to know the status of? *" + responseData.resData.docs[0].policyNumber + " and " + responseData.resData.docs[1].policyNumber + "*"
			}


			client.messages
				.create({
					body: msg,
					from: 'whatsapp:+14155238886',
					to: From
				})
				.then(message => console.log("Success"))
				.done();

		})
	}
	function renewStatusCheck() {
		policyStatus.getPolicyStatus({ phoneNo: From }, function (responseData) {
			console.log("responseData", JSON.stringify(responseData));
			if (responseData.num == 0) {
				var msg = "We didn't find any policy registered with your account"

			}
			else if (responseData.num == 1) {
				var msg = "Your policy " + responseData.resData.docs[0].policyNumber + " is " + responseData.resData.docs[0].policyState + ". It is going to expire on " + "*" + responseData.resData.docs[0].expiryDate + "*"
			}
			else if (responseData.num == 2) {
				var msg = "We have found " + responseData.num + " policies registered with your account. Please select one,\n" + responseData.resData.docs[0].policyNumber + "\n" + responseData.resData.docs[1].policyNumber + ""

			}
			else if (responseData.num == 3) {
				var msg = "We have found " + responseData.num + " policies registered with your account. Please select one,\n" + responseData.resData.docs[0].policyNumber + "\n" + responseData.resData.docs[1].policyNumber + "\n" + responseData.resData.docs[2].policyNumber

			} else {
				var msg = "We have found " + responseData.num + " policies registered with your account. Which one do you want to know the status of? *" + responseData.resData.docs[0].policyNumber + " and " + responseData.resData.docs[1].policyNumber + "*"
			}


			client.messages
				.create({
					body: msg,
					from: 'whatsapp:+14155238886',
					to: From
				})
				.then(message => console.log("Success"))
				.done();

		})
	}
	function policyStatusFunction() {
		console.log("Inside function")
		var msg = "Your OTP is verified";
		client.messages
			.create({
				body: msg,
				from: 'whatsapp:+14155238886',
				to: From
			})
			.then(message => {
				recordCheck.getRecords(From, function (error, response) {
					var msg = "We have found " + response.length + " policies registered with your account. Please select one?\n"+response[0].policyNumber +"\n"+response[1].policyNumber+"\n"+response[2].policyNumber

					client.messages
						.create({
							body: msg,
							from: 'whatsapp:+14155238886',
							//to: From
							to: From
						})

						 .then(message => {
							/* var msg = response[0].policyNumber +"\n"+response[1].policyNumber+"\n"+response[2].policyNumber;
							client.messages
							.create({
								body: msg,
								from: 'whatsapp:+14155238886',
								//to: From
								to: From
							})
							.then(message => console.log("Success"))
							.done(); */
							
						}) 
						.done();
				})
			})
			.done();
	}

});

app.get('/', function (req, res) {
	console.log("send");
	function user() {
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
						if (diffDays == 9) {
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
					"phNumber", "policyNumber", "expiryDate"
				]
			}
			db.find(query1, function (err, result) {
				if (err) {
					console.log(err)
				}
				else {
					console.log(result.docs[0].phNumber.split("+91")[1]);
					var msg = "Your policy " + result.docs[0].policyNumber + " is going to expire on " + result.docs[0].expiryDate + ". Please renew it immediately.";
					client.messages
						.create({
							body: msg,
							from: '+1 7177143763',
							//to:'+91 7337287299'
							to: '+91 ' + result.docs[0].phNumber.split("+91")[1]
						})
						.then(message => console.log("Harshitha"))
						.done();

				}
			});
		}
	}
	user().then(function (data) {
		user1(data);
	});
	res.send("send");
});

app.listen(process.env.PORT||3000, function () {
	console.log("Server is running at 3000");
});

