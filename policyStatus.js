
var Cloudant = require('cloudant');
var username = '670c7140-2118-4b76-ab85-9cb7899af063-bluemix';
var password = '8ccbc6a4e9238683ae3a027230328a3528bfddc';
var cloudant = Cloudant({url:"https://670c7140-2118-4b76-ab85-9cb7899af063-bluemix:8ccbc6a4e9238683ae3a027230328a3528bfddcad0eedaae69de6e6b8631f293@670c7140-2118-4b76-ab85-9cb7899af063-bluemix.cloudant.com"});
var policy= cloudant.db.use('policy_details');
var claims = cloudant.db.use('claims');
module.exports.getStatus=function(params,callback){
	//console.log(params)
	console.log(params)
	var query={
            "selector": {
               "policyNumber": {
                  "$eq": params
               }
            },
            "fields": []
          }
        policy.find(query,function(err,data){
                if(err)
                {
                    console.log(err);
                    callback(err,data)
                }
                else{     
				    
                    callback(err,data)        
                }   

        })
}

module.exports.getPolicyStatus=function(params,callback){
	  var query={
            "selector": {
               "phNumber": {
                  "$eq": params.phoneNo
               }
            },
            "fields": [
                       ]
          }
        policy.find(query,function(err,data){
                if(err)
                {
                    console.log(err);
                    callback({resData:'error'})
                }
                else{     
				    
                    callback({num:data.docs.length,resData:data})        
                }   

            })
}
   