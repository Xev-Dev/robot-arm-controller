const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const connection = require('../db.js')
router.post('/register',async(req,res)=>{
    const username = req.body.username
    const email = req.body.email
    const password = req.body.password
    console.log(password)
    console.log(email)
    console.log(username)
    let hashedPassword = await bcrypt.hash(password,8)
    connection.query('INSERT INTO user SET ?',{username:username,email:email,password:hashedPassword},async(err,results)=>{
        console.log(results)
        if(err){
            console.log(err)
            res.status(500).send('error')
        }else{
            console.log(results)
            res.status(200).send('registration succesfully')
        }
    })
})
router.post('/login',async(req,res)=>{
    const username = req.body.username
    const password = req.body.password
    console.log(username)
    console.log(password)
    if(username && password){
         connection.query('SELECT * FROM user WHERE username = ?',[username],async(error,results)=>{
             if(error){
                res.status(500).send(error)
             }else{
                if(results.length === 0 || !(await bcrypt.compare(password,results[0].password))){
                    res.status(404).send('user not found')
                }else{
                     console.log(results)
                    res.status(200).send('logged succesfully')
                }
             }
         })
    }
})
module.exports = router