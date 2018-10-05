module.exports=(params)=> {
var Cloudant = require('cloudant');
var username = '670c7140-2118-4b76-ab85-9cb7899af063-bluemix';
var password = '8ccbc6a4e9238683ae3a027230328a3528bfddc';
var cloudant = Cloudant({url:"https://670c7140-2118-4b76-ab85-9cb7899af063-bluemix:8ccbc6a4e9238683ae3a027230328a3528bfddcad0eedaae69de6e6b8631f293@670c7140-2118-4b76-ab85-9cb7899af063-bluemix.cloudant.com"});
var policy= cloudant.db.use('policy_details');
var claims = cloudant.db.use('claims');
   return new Promise(function(resolve,reject){
     console.log(params);
        var query={
            "selector": {
               "policyNumber": {
                  "$eq": params.policyNumber
               }
            },
            "fields": []
          }
        policy.find(query,function(err,data){
			console.log("inside find");
                if(err)
                {
                    console.log(err);
                    reject({resData:'error'})
                }
                else{ 
				console.log(data.docs);
				console.log(data.docs.length)
						if(data.docs.length >0){
							resolve({expiryDate:data.docs[0].expiryDate,policyState:data.docs[0].policyState}) 
						}
						else{
							resolve({"data":"There is no policy regarding your name"})
						}
				    //console.log("data",JSON.stringify(data.docs[0]));
                           
                }   

            })
     })
  }