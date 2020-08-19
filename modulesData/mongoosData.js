 const mongoose =require('mongoose')
 const passwordHash =require('password-hash')
 const emailSender = require('./emailSender');

 const {response}=require('express')
 const fs= require("fs")
 const flash = require("connect-flash")
 const url=  mongoose.connect('mongodb://localhost:27017', {
     useUnifiedTopology: true, useCreateIndex:true, useNewUrlParser:true,},(err)=>{
      if (err) {
          console.log(err);
      } else {
          console.log('hello mongoose');
      }
  })
 function connect() {
     return new Promise((resolve,reject) =>{
         if(mongoose.connection.readyState ===1){

           resolve()
         }else{
             mongoose.connect(url).then(()=>{
                 resolve()
             }).catch(eroor =>{
                 reject(eroor)
            })
         }
    })
 }
 const Schema = mongoose.Schema
 const userSchema = new Schema({
     fname:{
         type:String,
         required:true,
         max:50,
         min:2,
     },
     lname:{
         type:String,
         required:true,
         max:50,
         min:2,
     },
     email:{
         type:String,
         required:true,
         unique:true,
         max:100,
         min:5,

     },
     password:{
         type:String,
         required:true,
         max:100,
         min:2,
     },
     date:{
        type:Date,
        required:true
     },
     passwordToken: {
         type: String
     }

 })
 const Users =mongoose.model('user',userSchema)
 function registerUser( fname,lname,email,password) {
    return new Promise((resolve,reject)=>{
        connect().then(()=>{
            const newUser =new Users({
                fname,
                lname,
                password:passwordHash.generate(password),
                email,
                verfied: false,
                date:Date.now()

            })

            newUser.save().then(()=>{


                let message = 'Hi ' + fname + ' ' + lname + 'Welcome to our Website\n'
                message += 'to verify you email address please click in the following link\n'
                message += '' + newUser._id
                   emailSender.sendEmail(email, 'Verify Email', message).then(()=>{
                    resolve()
                    }).catch(error =>{
                            reject(error)
                    })
                }).catch(error =>{

                        reject(error)
                    })
        }).catch(error => {
            reject(error)
        })
    })
}
/////////
function checkUser(email, password) {
    // your code
    return new Promise((resolve, reject) => {
        connect().then(()=> {
            Users.findOne({
                email: email
            }).then(user => {
            //  console.log(user);
                if (user) {
                    if (passwordHash.verify(password, user.password)) {
                      //  console.log(user);
                        resolve(user)
                    } else {
                        reject(3)
                    }
                } else {
                  reject(3)
                }
            }).catch(error => {

                reject(error)
            })
        }).catch(error => {
            reject(error)
        })
    })
}
//////
const productSchema = new Schema({

    title:{
        type:String,
        required:true,

    },
    description:{
        type:String,
        required:true
    },
    preis:{
        type:Number,
        required:true
    },
    imgs:{
        type:[String],
        required:true,
        min:1
    },
    name:{
        type:String,
        required:true
    },
    telefonnummer:{
        type:Number,
        required:true
    },
    straße:{
        type:String,
        required:true
    },
    state:{
        type:String,
        required:true
    },
    zip:{
        type:String,
        required:true
    },
    kategorie:{
        type:String,
        required:true
    },
   date:{
       type:Date,
       required:true
    },
    userid:{
        type:String,
        required:true
    }

})
const Product =mongoose.model('product',productSchema)
function addProduct(title, description, preis,  productImgs,name,telefonnummer,straße,state,zip, userid, Kategorie) {
    return new Promise((resolve, reject) => {
        connect().then(()=>{
            Product.findOne({title: title, userid: userid}).then(findP => {
               //  console.log(findP);
                 if(findP) {
                   reject(3)
                 } else {
                    // create images array to be saved in database
                    const imgsArr = []
                    productImgs.forEach((img, idx) => {
                        // get file extension
                          let ext = img.name.substr(img.name.lastIndexOf('.'))
                          // set the new image name
                          let newName = title.trim().replace(/ /g, '_') + '_' + userid + '_' + idx + ext
                          img.mv('./public/uplodeFiles/' + newName)
                          imgsArr.push('/uplodeFiles/' + newName)
                    });
                      const newProduct =new Product({
                        title: title,
                        description: description,
                        preis: preis,
                        imgs: imgsArr,
                        kategorie:Kategorie,
                        name: name,
                        telefonnummer: telefonnummer,
                        straße: straße,
                        state: state,
                        zip:zip,
                        //kategorie:kategorie,
                        date:Date.now(),
                        userid: userid
                    })
                    newProduct.save().then(response => {
                        console.log(response);

                              resolve()

                      }).catch(error => {
                        console.log(error.code);

                      })
                }
            }).catch(error => {

              reject(error)
            })

    }).catch(error => {
        reject(error)
    })
})
}
function userproduct(userid) {
    return new Promise((resolve, reject) => {
        connect().then(() => {
            Product.find({userid:userid}).then(prod =>{
              prod.forEach(pro=>{
                pro['id']=pro['_id']
              })
            resolve( prod)
               //console.log(prod);
          }).catch(error => {

            reject(error)
        })
        Users.findOne({_id: userid}).then(user=>{

            if (user) {
                user.id=user._id

         //   console.log(user);

            resolve(user)
            } else {

                reject(new Error('can not find a user with this id'))
            }

          })

    }).catch(error => {

        reject(error)
    })
})
}
function getAllProducts() {
    return new Promise((resolve, reject) => {
        connect().then(() => {

            Product.find().then(prod =>{
                prod.forEach(pro=>{
                    pro['id']=pro['id']
              
              })

           
            resolve( prod)

          }).catch(error => {

            reject(error)
        })


    }).catch(error => {

        reject(error)
    })
})
}
function getKategorien(kategorie) {
    return new Promise((resolve, reject) => {
        connect().then(() => {

            Product.find({kategorie: kategorie}).then(kategor =>{
                 kategor.forEach(katego=>{
                     katego['id']=katego['id']

               })

             // console.log(kategor);

            resolve( kategor)


          }).catch(error => {

            reject(error)
        })


    }).catch(error => {

        reject(error)
    })
})
}
function getProduct(id) {
    return new Promise((resolve, reject) => {
        connect().then(() => {
            
            Product.findOne({_id: id}).then(product=>{

            if (product) {
                product.id=product._id

           // console.log(product);
           Users.findOne({_id: product.userid}).then(user=>{

            if (user) {
                user.id=user._id

          
                // resolve(product,user)
                resolve({product: product, user:user})
          //console.log(user);
            } else {

                reject(new Error('can not find a user with this id'))
            }

          }).catch(error => {
              reject(error)
          })
          
            } else {

                reject(new Error('can not find a product with this id'))
            }

          }).catch(error => {

            reject(error)
        })
          

          }).catch(error => {

            reject(error)
        })


    })

}

function getuser(id) {
    return new Promise((resolve, reject) => {
        connect().then(() => {
            Product.find({userid:id}).then(prod =>{
              prod.forEach(pro=>{
                pro['id']=pro['_id']
              })
            resolve( prod)
           // console.log(prod);
          }).catch(error => {

            reject(error)
        })
        

    }).catch(error => {

        reject(error)
    })
})

}
///////
function updateProduct(productid,newtitle,oldImgsUrls,newdescription,newpreis,newname,newtelefonnummer,newstraße,newstate,newzip,userid,newImgs ) {

    try {
        return new Promise((resolve, reject) => {
        (async()=>{
        let result =await getProduct(productid)
        oldProductData = result.product
        const deletedImgs=[]
        const keepImgs=[]
        oldProductData.imgs.forEach(img =>{
            if (oldImgsUrls.indexOf(img) >= 0) {
                keepImgs.push(img)
            } else {
                deletedImgs.push(img)
            }
        })
        console.log(productid);
        ///
        const newImgsUrlsArr=[]
        newImgs.forEach((img, idx) =>{
            const imgExt =img.name.substr(img.name.lastIndexOf('.'))
            const newImgName=newtitle.trim().replace(/ /g, '_') + '_' + userid + '_' + idx + '_' +(oldProductData.__v+1)+imgExt
            newImgsUrlsArr.push('/uplodeFiles/'+newImgName)
            img.mv('./public/uplodeFiles/'+newImgName)
        })
        deletedImgs.forEach(file=>{
            if (fs.existsSync('./public'+file)) {
                fs.unlinkSync('./public'+file)
            }
        })

         await Product.updateOne({_id: productid},{

                title:newtitle,
                description:newdescription,
                imgs:[...keepImgs, ...newImgsUrlsArr],
                preis:newpreis,
                name:newname,
                telefonnummer:newtelefonnummer,
                straße:newstraße,
                state:newstate,
                zip:newzip,
                $inc:{__v:1}
        })

        resolve()
        })()
    }).catch(error => {
        reject(error)
    })

} catch (error) {
    reject(error)
}

}
///search
function search(term) {
    return new Promise((resolve, reject) => {
        connect().then(() => {
            const regexp = new RegExp('^' + term + '\w|' + term + '|\w' +term + '\w' + '|\w' + term + '$')
            Product.find({ "title": regexp }).then(results =>{
                
             // console.log(results);

             Product.find({ "description": regexp }).then(results1 =>{
                
                // console.log(results);
                results1.forEach(result => {
                    let check = true
                    results.forEach(res => {
                        if (result.id === res.id){
                            check = false
                        }
                        if(check){
                            results.push(result)
                        }
                    })
                })
               resolve( results)
   
   
             }).catch(error => {
   
               reject(error)
           })


          }).catch(error => {

            reject(error)
        })


    }).catch(error => {

        reject(error)
    })
    })    
}
function deleteProduct(productid, userid) {
    return new Promise((resolve, reject) => {
        getProduct(productid).then(prod => {
            // check if the book belong to the current login user
            if (prod.user.id === userid) {
                // delete book images
                prod.product.imgs.forEach(img => {
                    //check the img file is exist then delete it
                    if (fs.existsSync('./public' + img)){
                        fs.unlinkSync('./public' + img)
                    }
                })
                Product.deleteOne({_id: productid}).then(() => {
                       
                        resolve()
                    }).catch(error => {
                        
                        reject(error)
                    })
                
            } else {
                reject(new Error('can not find a product with this id'))
            }
        }).catch(error => {
            reject(error)
        })
    })
    
  }

  function updateUser(newfname,newlname,newemail,password,userId ) {
    try {
  
        return new Promise((resolve, reject) => {
            (async()=>{
         await Users.updateOne({_id: userId}),{
            fname:newfname,
            lname:newlname,
            password:password,
            email:newemail,
                $inc:{__v:1}
          }
          if (_id= userId) {
            user.id=user._id
     //   console.log(user);
        resolve()
        } else {

            reject(new Error('can not find a user with this id'))
        }
        })()
        }).catch(error => {
            reject(error)
        })
    } catch (error) {
        reject(error)
    }
}

////////////
function checkEmail(email) {
    // your code
    return new Promise((resolve, reject) => {
        connect().then(()=> {
            Users.findOne({
                email: email
            }).then(user => {
              
                 if (user) {
                   user.passwordToken = user.id
                   user.save().then(() => {
                       console.log(user);
                    resolve(user)
                   }).catch(error => {
                       reject(error)
                   })
                         
                     
                 } else {
                    reject(3)
                 }
               
                
            }).catch(error => {

                reject(error)
            })
        }).catch(error => {
            reject(error)
        })
    })
}
function checkPassword(password,userToken) {
    // your code
    return new Promise((resolve, reject) => {
        connect().then(()=> {
            Users.find({
                password:userToken
            }).then(user => {
                user.forEach(resul => {
                    resul[id]=result[passwordToken]
                });
                if (resul) {
                    if (passwordHash.verify(password, user.password ==user.passwordToken)) {
                        console.log(resul);
                        resolve(resul)
                    } else {
                        reject(3)
                    }
                } else {
                  reject(3)
                }
            }).catch(error => {

                reject(error)
            })
        }).catch(error => {
            reject(error)
        })
    })
}
module.exports={
    registerUser,
    checkUser,
    addProduct,
    userproduct,
    getAllProducts,
    getProduct,
    updateProduct,
    getuser,
    getKategorien,
    search,
    deleteProduct,
    updateUser,
    checkEmail,
    checkPassword
    

}