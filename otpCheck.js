module.exports=  (params) => {
    const Nexmo= require('nexmo');
    const nexmo = new Nexmo({
      apiKey: 'f6ea10e7',
      apiSecret: 'A6nxzs2qKgj8gi3W'
      });
      console.log(params);
      return new Promise(function(resolve,reject){
      nexmo.verify.check({request_id: params.requestId, code: params.pin}, (err, result) => {
        if(err) {
            console.log('error occured',err)
          reject ({resData:'error'})
          // handle the error
        } else {
            console.log('Account verified!')
            resolve ({resData:result.status});
        }
      });
    });
//    return {values:params.phoneNumber}
  };
  
  module.exports.otpCheck=function(params,callback){
	const Nexmo= require('nexmo');
    const nexmo = new Nexmo({
     apiKey: 'f6ea10e7',
      apiSecret: 'A6nxzs2qKgj8gi3W'
      });
      console.log(params);
	  nexmo.verify.check({request_id: params.requestId, code: params.pin}, (err, result) => {
        if(err) {
            console.log('error occured',err)
			callback({resData:'error'})
          // handle the error
        } else {
            console.log('Account verified!')
            callback({resData:result.status});
        }
      });
  }
  