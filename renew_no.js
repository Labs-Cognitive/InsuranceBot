module.exports=(params)=> {
var Cloudant = require('cloudant');
var username = '670c7140-2118-4b76-ab85-9cb7899af063-bluemix';
var password = '8ccbc6a4e9238683ae3a027230328a3528bfddc';
var cloudant = Cloudant({url:"https://670c7140-2118-4b76-ab85-9cb7899af063-bluemix:8ccbc6a4e9238683ae3a027230328a3528bfddcad0eedaae69de6e6b8631f293@670c7140-2118-4b76-ab85-9cb7899af063-bluemix.cloudant.com"});
var policy= cloudant.db.use('policy_details');
var db = cloudant.db.use('policy_details');
return new Promise(function(resolve,reject){
console.log(params);
var query1={
   "selector": {
      "policyNumber": {
         "$eq": params.policy
      }
   },
   "fields": [
      "policyType","policyNumber","VIN"
   ]
}
db.find(query1, function(err, result) {
	if(err){
		console.log(err);
		reject({resData:'error'});
		
	}
	else{
		  resolve({resData:result}) 
 
}
})
})
	
}
