const Nexmo= require('nexmo');
    const nexmo = new Nexmo({
      apiKey: 'f6ea10e7',
      apiSecret: 'A6nxzs2qKgj8gi3W'
      });
    
	/*  module.exports=  (params)=> {
    const Nexmo= require('nexmo');
    const nexmo = new Nexmo({
      apiKey: '26d76bae',
      apiSecret: 'JoPAxWIVReuWKDp2'
      });
      return new Promise(function(resolve,reject){
        nexmo.verify.request({format:'json', number: params.phoneNo, country:'IN', pin_expiry:120, brand: 'Insurance Bot'}, (err, result) => {
          console.log('inside the nexmo');
          if(err) {
            console.log(err)
            reject ({resData:{result:'error'}});
          } else {
            console.log(result)
            if(result) {
              resolve({resData:{result:'success',requestId: result.request_id}}); 
            } else {
              reject({resData:{result:'error'}});
            }
          }
        });
      })
  };
  */
  
  module.exports.test=function(params,callback){
	  nexmo.verify.request({format:'json', number: params.phoneNo, country:'US', pin_expiry:120, brand: 'Insurance Bot'}, (err, result) => {
          console.log('inside the nexmo');
          if(err) {
            console.log(err)
            callback({resData:{result:'error'}});
          } else {
            console.log(result)
            if(result) {
              callback({resData:{result:'success',requestId: result.request_id}}); 
            } else {
              callback({resData:{result:'error'}});
            }
          }
        });
  }
