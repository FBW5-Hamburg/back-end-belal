const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'belalesukari@gmail.com',
        pass: '????????????'
    }
})

function sendEmail(email, message,) {
return new Promise((resolve, reject) => {
    const mailOption ={
        from: 'blabla@gmail.com',
        to: email,
        text:  message
    }
    transporter.sendMail(mailOption, function (error, info) {
        if(error){
            console.log(error);
            reject(error)
            
        } else {
            console.log(info.response);
            resolve(info.response)
        }
      })
})
    

  }
 
  
  
  function getEmail( emailUser,messageUsr, subject, callback) {
  
      const mailOption ={
          from: 'blabla@gmail.com',
          to: emailUser,
          subject: subject,
          text:   messageUsr
      }
      transporter.sendMail(mailOption, function (error, info) {
          if(error){
              console.log(error);
              callback(false);
              
          } else {
              console.log(info.response);
              callback(true);
          }
        })
  
    }
  function getEmailAbout(email,message,subject,callback) {
    const mailOption ={
        from: email,
        to:' belalsukari@gmail.com',
        subject: subject,
        text:   message
    }
    transporter.sendMail(mailOption, function (error, info) {
        if(error){
            console.log(error);
            callback(false);
            
        } else {
            console.log(info.response);
            callback(true);
        }
      })
  }
   
  module.exports = { 
      sendEmail,
      getEmail,
      getEmailAbout
 }
