module.exports=(params)=> {
var Cloudant = require('cloudant');
var username = '670c7140-2118-4b76-ab85-9cb7899af063-bluemix';
var password = '8ccbc6a4e9238683ae3a027230328a3528bfddc';
var cloudant = Cloudant({url:"https://670c7140-2118-4b76-ab85-9cb7899af063-bluemix:8ccbc6a4e9238683ae3a027230328a3528bfddcad0eedaae69de6e6b8631f293@670c7140-2118-4b76-ab85-9cb7899af063-bluemix.cloudant.com"});
var policy= cloudant.db.use('policy_details');
var vin = cloudant.db.use('vin');
   return new Promise(function(resolve,reject){
     console.log(params);
        var query={
            "selector": {
               "vin": {
                  "$eq": params.vin
               }
            },
            "fields": [
                       ]
          }
        vin.find(query,function(err,data){
                if(err)
                {
                    console.log(err);
                    reject({resData:'error'})
                }
                else{     
				    console.log({num:data.docs.length,resData:data});
                    resolve({num:data.docs.length,resData:data})        
                }   

            })
     })
  }
  //module.exports({"vin":"VF23VRHYF42356165"});