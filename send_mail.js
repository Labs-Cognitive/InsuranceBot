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
    subject: 'Business Insurance Quote', // Subject line 
    html: 'Thank you for choosing Kelly - the insurance bot! for your insurance needs.<br><br> Your quote id is QWASZ123.This quote Id will be valid for 15 days from today or till the expiry date inserted at the time of quote generation (for Motor policy) whichever is earlier converage cost<br><br><table border="1"> <tr><th>Converage </th><th>Cost</th> </tr><tr><td>Basic premium</td><td>$749</td> </tr> <tr> <td>Discount</td><td>$131</td> </tr><tr><td>Tax</td> <td>$3</td> </tr><tr><td>Net Payable Amount</td><td>$617</td></tr></table><br>For your convenience, we provide all online payment options including Credit Cards, Debit Cards and Netbanking.<br>If you need any further assistance or support, you can contact your agent directly.', // plaintext body 
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

