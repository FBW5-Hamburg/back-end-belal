const express =require('express')
const router =express.Router()

const dataModule = require('../modulesData/mongoosData')
  router.use((req,res,next) => {
    if ( req.session.user ) {
        next()
    } else {
        res.redirect('/login')
    }
    })


router.get('/',(req,res)=>{
    res.render('admin')
   
})




//////////////Add Product ////////////
router.get('/addProduct',(req,res)=>{
    res.render('addProduct')
   
})
router.post('/addProduct',(req, res) => {
    console.log(req.body);
   console.log(Object.keys( req.files))
     if (req.files) {
    // console.log(Object.keys( req.files));
     const title =req.body.title
     const productImgs =req.body.productImgs
     const description =req.body.description
     const preis =req.body.preis
     const name =req.body.name
     const telefonnummer =req.body.telefonnummer
     const straße =req.body.straße
     const state =req.body.state
     const zip =req.body.zip
     const Kategorie =req.body.Kategorie
     if (title && description &&preis&&  name &&telefonnummer&&straße&&state&&zip&& Object.keys(req.files).length >1) {
        const imgs =[]
        for(const key in req.files){
            if (req.files[key].mimetype !='application/pdf') {
                imgs.push(req.files[key])
               // console.log(req.files[key]);
                
            }
        }
        
      //  console.log(imgs);
         
     dataModule.addProduct(title,description,preis,imgs,name,telefonnummer,straße,state,zip,req.session.user._id, Kategorie ).then(() => {
         res.json(1)
     }).catch(error =>{
        if (error==3) {
            res.json(3)
        }
     })
    } else {
        res.json(2)
    }
} else {
    res.json(2)
}
// router.get('/logout', (req, res) => {
//     req.session.destroy()
//     res.redirect('/login')
// })
    })
   router.get('/product', (req, res) => {
    
    let sm=req.session.user
        dataModule.userproduct(sm._id).then(products => {
           
            res.render('product', {products,sm})
          
        }).catch(error=>{
            res.send('404,Product could not be found')
        })
       
        
    })
    
    
    router.get('/edit-data', (req, res) => {
        let sm=req.session.user
        dataModule.userproduct(sm._id).then(products => {
            res.render('edit-data', {products,sm})
        }).catch(error=>{
            res.send('404,Product could not be found')
        })    
    })
    router.post('/edit-data', (req, res) => {
        const {newfname,newlname,newemail,userId} = req.body
       console.log(newfname,newlname,newemail,userId)
       dataModule.updateUser(newfname,newlname,newemail,userId,req.session.user._id).then(()=>{
   res.json(1)
   }).catch(error => {
       res.json(2)
  })    
})

    
    router.get('/product/:id', (req, res) => {
        const productid = req.params.id
        dataModule.getProduct(productid).then(product => {
            res.render('editProduct', {product:product.product})
           // console.log(product);
        }).catch(error => {
            res.send("this Product is not exist");
        })
    
    })
    //
    router.post('/editProduct', (req, res) => {
          const {newTitle, oldImgsUrls,newdescription,newpreis,newname,newtelefonnummer,newstraße,newstate,newzip,productid} = req.body
         console.log(newTitle, oldImgsUrls,newdescription,newpreis,newname,newtelefonnummer,newstraße,newstate,newzip,productid )
        // console.log(req.files)
        const newImgs = []
         if (req.files) {
            
          for (const key in req.files) {
              if (req.files[key].mimetype != 'application/pdf') {
                  newImgs.push(req.files[key])
              }
         }
    } 
  // console.log(newImgs);
         let oldImgsUrlsArr =JSON.parse(oldImgsUrls)
         oldImgsUrlsArr =oldImgsUrlsArr.map(element => {
             return element.substr(element.indexOf('/uplodeFiles/')) 
         });
         //console.log(oldImgsUrlsArr);
         dataModule.updateProduct(productid,newTitle, oldImgsUrlsArr,newdescription,newpreis,newname,newtelefonnummer,newstraße,newstate,newzip,req.session.user._id,newImgs).then(()=>{
     res.json(1)
     }).catch(error => {
         res.json(2)
    })    
})

router.post('/deleteproduct', (req, res) => {
    const productid = req.body.productid
    dataModule.deleteProduct(productid, req.session.user._id).then(() => {
        res.json(1)
    }).catch(error => {
        res.json(2)
    })
})
router.get('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/login')
})


module.exports=router
