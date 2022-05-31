const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const connection = require('../db.js')
router.post('/register',async(req,res)=>{
    const username = req.body.username
    const password = req.body.password
    const password_confirmation = req.body.password_confirmation
    console.log(password)
    console.log(username)
    console.log(password_confirmation)
    if(username&&password && password===password_confirmation){
        connection.query('SELECT * FROM users WHERE username = ?',[username],async(error,results)=>{
            if(results.length===0){
                let hashedPassword = await bcrypt.hash(password,8)
                connection.query('INSERT INTO users SET ?',{username:username,password:hashedPassword},async(err,results)=>{
                    console.log(results)
                    if(err){
                        console.log(err)
                        res.status(500).json({'registered':false})
                    }else{
                        console.log(results)
                        res.status(200).json({'registered':true})
                    }
                })
            }else{
                res.status(500).json({'registered':false})
            }
        })
    }else{
        res.status(500).json({'registered':false})
    }
})
router.post('/login',async(req,res)=>{
    const username = req.body.username
    const password = req.body.password
    console.log(username)
    console.log(password)
    if(username && password){
         connection.query('SELECT * FROM users WHERE username = ?',[username],async(error,results)=>{
             if(error){
                res.status(500).send(error)
             }else{
                if(results.length === 0 || !(await bcrypt.compare(password,results[0].password))){
                    res.status(404).json({'logged':false})
                }else{
                     console.log(results)
                    res.status(200).json({'logged':results[0]})
                }
             }
         })
    }else{
        res.status(500).json({'logged':false})
    }
})
module.exports = router