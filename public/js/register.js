document.querySelector('#registerBtn').addEventListener('click', e => {
    e.preventDefault()
    const fname = document.querySelector('#fname').value.trim()
    const lname = document.querySelector('#lname').value.trim()
    const email = document.querySelector('#emailInp').value.trim()
    const password = document.querySelector('#passInp').value.trim()
    const repassword = document.querySelector('#repassInp').value.trim()
   
    // check data is not empty and password matches the repassword
    if (email && password &&lname&&fname && password == repassword) {
        // create object to be sent
       
        const sentObj = {
            fname,
            lname,
            email,
            password,
            repassword,
           
        }
        // send data using fetch
        fetch('/register',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sentObj)
        }).then(response => {
            if(response.status == 200) {
                response.json().then(data => {
                    //console.log(data)
                    switch (data) {
                        case 1:
                            showModal(false, "Register Success", "you can go to login page...")
                            window.location = '/login'
                            break;
                        case 2:
                        showModal(true, "missing ertries", "you miss some entries or your password does not match repassword")
                            break;
                        case 3:
                            showModal(true, "Email is registered", "this email already registered to the system")
                            break;
                        case 4:
                            showModal(true, "Server Error", "Something unexpected happened. please contact the system Adminstrator")
                            break;
                    
                        default:
                            showModal(true, "Server Error", "Something unexpected happened. please contact the system Adminstrator")
                            break;
                    }
                }).catch(error => {
                    console.log(error);
                    showModal(true, "error on getting data", 'please contact the Administrator')
                })
            }
        }).catch(error => {
            console.log(error)
            showModal(true, "server side error", error.message)
        })
    } else {
        showModal(true, "missing ertries", "you miss some entries or your password does not match repassword")
    }
})


//////////////////////// LOGIN ///////
document.querySelector('#loginBtn').addEventListener('click', e => {
    e.preventDefault()
    const email = document.querySelector('#emaiLogen').value.trim()
    const password = document.querySelector('#passLogen').value.trim()
    
    if (email && password ) {
        // create object to be sent
        const sentObj = {
            email,
            password
        }
        // send data using fetch
        fetch('/login',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sentObj)
        }).then(response => {
            if(response.status == 200) {
                response.json().then(data => {
                    //console.log(data)
                    switch (data) {
                        case 1:
                            window.location = '/admin/product'
                            break;
                        case 2:
                        showModal(true, "missing ertries", "you miss some entries ")
                            break;
                        case 3:
                            showModal(true, "Login Error", "Either the email or password is wrong")
                            break;
                        case 4:
                            showModal(true, "Server Error", "Something unexpected happened. please contact the system Adminstrator")
                            break;
                    
                        default:
                            showModal(true, "Server Error", "Something unexpected happened. please contact the system Adminstrator")
                            break;
                    }
                }).catch(error => {
                    console.log(error);
                    showModal(true, "error on getting data", 'please contact the Administrator')
                })
            }
        }).catch(error => {
            console.log(error)
            showModal(true, "server side error", error.message)
        })
    } else {
        showModal(true, "missing ertries", "you miss some entries ")
    }
})