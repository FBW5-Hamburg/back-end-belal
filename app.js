const express =require('express')
const session = require('express-session')
//const logger =require('morgan')
const mongoose =require('mongoose')
const async =require('async')
const crypto =require('crypto')
const flash = require("connect-flash")
//const sequelize =require('sequlize')
//const Op =sequelize.Op

const io =require('socket.io')
const fileupload = require('express-fileupload')
const adminRouter =require('./routes/user-routes') 
const path =require('path')
const cookie = require('cookie-parser')
const db =require('./modulesData/mongoosData')
const emailSender =require('./modulesData/emailSender')
const { brotliDecompress } = require('zlib')
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

app.use('/admin',adminRouter)
app.use(flash());

 app.get('/home',(req,res)=>{
     db.getAllProducts().then(allproduct => {
         res.render('home', {allproduct})
     })
 })
 app.get('/home/:kategorie',(req,res)=>{
    let kategori=req.query.kategorie
   
       db.getKategorien(req.params.kategorie).then(kategorie => {
           res.render('kategorie', {kategorie})
          // console.log(kategorie);
       })
    
   
})
app.get('/home/product-single/:title/:id', (req, res) => {
   //console.log(req.session.user)
    db.getProduct(req.params.id).then((product) => {
      // console.log(product.user);
        let checLogin =false
        if (req.session.user) {
            checLogin =true
        }

        res.render('product-single', {product:product.product,checLogin,user:product.user})
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
                     res.redirect('/login')
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
     res.render('changepassword',{userToken})
})
app.post('/changepassword/:token', (req, res) => {
    const password=req.body.password
    const repassword=req.body.repassword
    const userToken = req.params.token
    console.log(password,userToken);
    if (password && repassword) {
        db.checkPassword(password).then(()=> {
            
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
       db.getuser(sm.id).then(products => {
           console.log(sm.id);
            res.render('allProductUser', {products,sm})
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
    })
            })
    
  
    
 
// app.post('/search', (req, res) => {
//     // const dv=req.query.term
//     // console.log(dv);
//     db.search(dv).then(result =>{
//        // console.log(result);
//             })  
//  })




  app.listen(3000,()=>{
    console.log('it is working on port 3000')
})