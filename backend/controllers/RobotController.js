const express = require('express')
const router = express.Router()
const connection = require('../db.js')
router.post('/registerMovement',async(req,res)=>{
    const arm = req.body.arm
    const radians = req.body.radians
    const id_record = req.body.id_record
    connection.query('INSERT INTO movement SET ?', {arm,radians,id_record}, async(err,results)=>{
        console.log(results)
        if(err){
            console.log(err)
            res.status(500).json('error')
        }else{
            console.log(results)
            res.status(200).json('movement registered succesfully')
        }    
    })
})
router.post('/registerPosition',async(req,res)=>{
    const arm1 = req.body.arm1
    const arm2 = req.body.arm2
    const arm3 = req.body.arm3
    const base = req.body.base
    const head = req.body.head
    const id_record = req.body.id_record
    connection.query('INSERT INTO position SET ?', {base,arm1,arm2,arm3,head,id_record}, async(err,results)=>{
        console.log(results)
        if(err){
            console.log(err)
            res.status(500).json({'error':err})
        }else{
            console.log(results)
            res.status(200).json({'error':false})
        }    
    })
})
router.post('/registerRecord',async(req,res)=>{
    let user = req.body.id
    connection.query('INSERT INTO record SET ?', {user}, async(err,results)=>{
        console.log(results)
        if(err){
            console.log(err)
            res.status(500).json({'error':err})
        }else{
            console.log(results)
            res.status(200).json({'error':false})
        }    
    })
})
router.get('/getMovements/:idRecord',async(req,res)=>{
    console.log(req.params)
    connection.query(`SELECT * FROM movement WHERE id_record = ?`,[parseInt(req.params.idRecord)], async(error,results)=>{
        if(error){
            console.log(error)
            res.status(500).json({'error':error})
        }else{
            res.status(200).json(results)
        }
    })
})
router.get('/getPosition/:idRecord',async(req,res)=>{
    connection.query(`SELECT * FROM position WHERE id_record = ?`,[parseInt(req.params.idRecord)], async(error,results)=>{
        if(error){
            console.log(error)
            res.status(500).json({'error':error})
        }else{
            console.log(results)
            res.status(200).json(results)
        }
    })
})
router.get('/getRecord',async(req,res)=>{
    connection.query(`SELECT record.id, users.username
    FROM record
    INNER JOIN users ON users.id=record.user`, async(error,results)=>{
        if(error){
            console.log(error)
            res.status(500).json({'error':error})
        }else{
            console.log(results)
            res.status(200).json(results)
        }
    })
})
module.exports = router