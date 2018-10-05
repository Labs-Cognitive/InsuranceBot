module.exports = function(mailid,callback){
	console.log(mailid);
var nodemailer = require('nodemailer');
 
// create reusable transporter object using the default SMTP transport 
var transporter = nodemailer.createTransport({service: 'Gmail',
                    auth: {
                        user: 'insurancebot123@gmail.com',
                        pass: 'Moturi@123'	
}
});
 
// setup e-mail data with unicode symbols 
var mailOptions = {
    from: 'insurancebot123@gmail.com', // sender address 
    to: 'insurancebot123@gmail.com', // list of receivers 
    subject: 'Policy Statement',
	attachments: [{
				filename: 'PolicyDocument.pdf',
				path: __dirname+'/PolicyDocument.pdf'
				
			}
			
		]
   };
 
// send mail with defined transport object 
transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }else{
    callback('success');
	}
});
}

