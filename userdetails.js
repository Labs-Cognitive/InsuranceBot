module.exports=(params)=> {
    var Cloudant = require('cloudant');
    var username = '670c7140-2118-4b76-ab85-9cb7899af063-bluemix';
    var password = '8ccbc6a4e9238683ae3a027230328a3528bfddc';
    var cloudant = Cloudant({url:"https://670c7140-2118-4b76-ab85-9cb7899af063-bluemix:8ccbc6a4e9238683ae3a027230328a3528bfddcad0eedaae69de6e6b8631f293@670c7140-2118-4b76-ab85-9cb7899af063-bluemix.cloudant.com"});
    var user_details= cloudant.db.use('details');
       return new Promise(function(resolve,reject){
         console.log(params);
        var query= {
            "selector": {
               "phNumber": {
                  "$eq": params.PhoneNumber
               }
            },
            "fields": [
               "fName",
               "lName"
            ]
         }
            user_details.find(query,function(err,data){
                    if(err)
                    {
                        console.log(err);
                        reject({resData:'error'})
                    }
                    else{     
                        console.log({resData:data});
                        resolve({resData:data})  
                       // callback({resData:data})      
                    }   
    
                })
         })
      }