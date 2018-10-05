module.exports=()=> {
var unirest = require('unirest');
var authdata = {
"password":"1234abcd68zBF1bo8KwNVpGLw8aAdB6Q",
"username":"mounika@mss.com",
"client_id":"3MVG9zlTNB8o8BA2ZPvCXYTq9hcbC0hnv89yynx2kUnKYF4YcNbhCdJK.kOMj6BOYV.A4Ch2fUb5TKN9I8jWR",
"client_secret":"3258732558549441891",
"grant_type": "password"
}

return new Promise(function(resolve,reject){
	unirest.post('https://login.salesforce.com/services/oauth2/token')
.headers({'content-type': 'application/x-www-form-urlencoded'})
.send(authdata)
.end(function (response) {
  console.log(response.body);
  if(response.body.error != "error"){
	  resolve({authToken : response.body.access_token})
  }
  else{
	  reject({"error":"Authentication Failed"})
  }
});
})

}

