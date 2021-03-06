const express =require('express')
const session = require('express-session')
const fs = require('fs')
// const mongoose =require('mongoose')
// const async =require('async')
// const crypto =require('crypto')
const flash = require("connect-flash")
const port = process.env.PORT || 3000
//const io =require('socket.io')
const fileupload = require('express-fileupload')
const adminRouter =require('./routes/user-routes') 
//const path =require('path')
const cookie = require('cookie-parser')
const db =require('./modulesData/mongoosData')
const emailSender =require('./modulesData/emailSender')
const app =express()
app.use(express.static(__dirname + '/public'))
app.use(express.static('node_modules'))
app.set ('view engine','ejs')
app.set('views',__dirname + '/views');
//app.use(logger('dev'))
app.use(express.urlencoded({extended:false}))
app.use(express.json())

const sessionOptions = {
    secret: 'Kleinanzeigen',
    cookie: {}
}
app.use(session(sessionOptions))
app.use(cookie())
app.use(fileupload({
    limits: { fileSize: 50 * 1024 * 1024 }
}))

  app.use(function(req, res, next) {
      res.locals.user = req.session.user;
      next();
    });
app.use('/admin',adminRouter)
//app.use(flash());

  app.get('/',(req,res)=>{
    var limit =8
         var skip = 8*('home'-1)
      db.getAllProducts(limit,skip).then(allproduct => {
       
          res.render('home', {allproduct})
      }).catch(error=>{
       
         res.send('404,Product could not be found')
     })
  })
  app.get('/home/:page?',(req,res)=>{
     let page =1
     if (req.params.page) {
         page=parseInt(req.params.page)   
     }
     if (req.params.page==0) {
         page=1  
     }
     var limit =8
     var skip = 7 * (page-1)
    
     
      db.getAllProducts(limit,skip).then(allproduct => {
       
          res.render('home', {allproduct})
      }).catch(error=>{
      
         res.send('404,Product could not be found')
     })
  })
 app.get('/about',(req,res)=>{
        res.render('about')
    
})
app.post('/about',(req,res)=>{
    console.log(req.body.email);
    const name = req.body.name
    const email = req.body.email
    const subject = req.body.subject
    const message = req.body.message
    console.log(name,email,subject,message);
    
        emailSender.getEmailAbout(email,'name:'+ name+'\n'+'email:'+email+'\n' + message ,subject , (ok) => {
            if(ok){
                res.render('about') 
            } else{
                
                res.send('error')
            }
        });
})
 app.get('/katergorie/:kategorie',(req,res)=>{
       db.getKategorien(req.params.kategorie).then(kategorie => {
           res.render('kategorie', {kategorie})
          // console.log(kategorie);
       }).catch(error=>{
        res.send('404,Product could not be found')
    })
})
app.get('/product-single/:title/:id', (req, res) => {
    db.getProduct(req.params.id).then((product) => {
        res.render('product-single', {product:product.product,users:product.user})
       // console.log();
    }).catch(error=>{
        res.send('404,Product could not be found')
    }) 
})
app.get('/home/product-single/:title/:id', (req, res) => {
    db.getProduct(req.params.id).then((product) => {
        res.render('product-single', {product:product.product,users:product.user})
       // console.log();
    }).catch(error=>{
        res.send('404,Product could not be found')
    })
    
})
app.get('/katergorie/product-single/:title/:id', (req, res) => {
    
     db.getProduct(req.params.id).then((product) => {
         let checLogin =false
         if (req.session.user) {
             checLogin =true
         }
 
         res.render('product-single', {product:product.product,checLogin,users:product.user})
        // console.log();
     }).catch(error=>{
         res.send('404,Product could not be found')
     })
     
 })
app.get('/register',(req,res)=>{
          res.render('register')
})

app.post('/register',(req,res)=>{
    console.log(req.body);
     const fname=req.body.fname
     const lname=req.body.lname
     const email = req.body.email.trim()
     const password = req.body.password
     const repassword = req.body.repassword
   
     if ( (fname && lname && password && email &&password===repassword)){
        db.registerUser(fname,lname,email, password).then(() => {
           
             res.json(1)
         }).catch(error => {
            console.log(error);
            if (error == "exist") {
                res.json(3)
            } else {
                res.json(4)
            }
           
         })
    } else{
             res.json(2)
         }
        })

        ////////////
        app.get('/login',(req,res)=>{
            if (req.session.user){
                console.log(req.session.user);
                res.redirect('/admin/product')
            } else {
                res.render('login')
            }
        })
  app.post('/login',(req,res)=>{
          if (req.body.email && req.body.password) {
           db.checkUser(req.body.email.trim(), req.body.password).then(user => {
                 req.session.user = user
                // console.log(user)
                 res.json(1)
             }).catch(error => {
                 if (error==3 ) {
                     res.json(3)
                 } else {
                     res.json(4)
                 }
             })
         } else {
             res.json(2)
         }
   
  })
  
  app.get('/forgot',(req,res)=>{
  
res.render('forgot')
})
app.post('/forgot',(req,res)=>{
    const emailus =req.body.email
    console.log(emailus);
if (emailus) {
    db.checkEmail(req.body.email.trim() ).then(user=>{
                 //console.log(user)
                 const message = 'to reset your password please click the following link\n'+
                 'http://localhost:3000/changepassword/'+user.id
                 emailSender.getEmail(emailus,message, 'change password',(ok) => {
                     if(ok){
                         res.json(1)
                     } else {
                        res.json(3)
                     }
                 })
                 
             }).catch(error => {
                 if (error==3 ) {
                     res.json(3)
                 } else {
                     res.json(4)
                 }
       
    })
} else {
    res.json(2)
}    
})
app.get('/changepassword/:id', (req, res) => {
const userToken = req.params.id
console.log(userToken);
db.checkPasswordToken(userToken).then(() => {
    res.render('changepassword',{userToken})
}).catch(error => {
    res.send('this link is not valid')
})
    

     
})
app.post('/changepassword', (req, res) => {
    const newpassword=req.body.password
    const userToken = req.body.token
    console.log(newpassword,userToken);
    if (newpassword) {
        db.checkPassword(newpassword,userToken).then(()=> {
            
              res.json(1)
          }).catch(error => {
              if (error==3 ) {
                  res.json(3)
              } else {
                  res.json(4)
              }
          })
      } else {
          res.json(2)
      }
    })



   app.get('/allProductUser/:id', (req, res) => {
     let sm=req.params
    // console.log(sm);
   
        db.getuser(sm.id).then(product => {
           
            //console.log(sm.id);
             res.render('allProductUser', {products:product.prod,us:product.user})
            // console.log(products);
         }).catch(error=>{
             res.send('404,Product could not be found')
         })
 })
 app.post('/product', (req, res) => {
    console.log(req.body);
    const idSeller=req.body.idSeller
    const emailUser = req.body.emailUser
    const messageUser = req.body.messageUser
    //console.log(emailUser);
    db.getProduct(idSeller).then((result) => {
        if(emailUser != "" ){
            emailSender.getEmail( result.user.email, messageUser + '\n' + emailUser + '\n' + result.product.title, 'Message from Customer', (ok) => {
                if(ok){
                    
                    res.json(1)
                    //res.redirect('/home/product-single/:title/:id')
                } else{
                    
                    res.json(2)
                }
            });
        }
      }).catch(error=>{
          res.send('404,Product could not be found')
      })
       
    //  ctrl k u
     
});
app.get('/search', (req, res) => {
    const dv=req.query.term
    console.log(dv);
    db.search(req.query.term).then(result => {
        res.render('search', {result})
    }).catch(error=>{
        res.send('404,Product could not be found')
    })
    })
  app.listen(port,()=>{
    console.log('it is working on port 3000')
})