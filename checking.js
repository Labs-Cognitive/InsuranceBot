var Cloudant = require('cloudant');
var username = '670c7140-2118-4b76-ab85-9cb7899af063-bluemix';
var password = '8ccbc6a4e9238683ae3a027230328a3528bfddc';
var cloudant = Cloudant({url:"https://670c7140-2118-4b76-ab85-9cb7899af063-bluemix:8ccbc6a4e9238683ae3a027230328a3528bfddcad0eedaae69de6e6b8631f293@670c7140-2118-4b76-ab85-9cb7899af063-bluemix.cloudant.com"});

module.exports.getRecords=function(phoneNo,callback){
var db = cloudant.db.use('policy_details');	
  var query={
            "selector": {
               "phNumber": {
                  "$eq":phoneNo 
               }
            },
            "fields": [
               
            ]
          }
db.find(query,function(err,data){
				
				if(err)
				{
					callback(err,null);
				
				}
				else{
					
				console.log("success");
				callback(null,data.docs);
        		
				}
				
				
			}	
			)
	
}
