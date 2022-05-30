const express = require('express')
const router = express.Router()
const connection = require('../db.js')
router.post('/registerMove/:idRecord',async(req,res)=>{

})
router.post('/registerPosition/:idRecord',async(req,res)=>{

})
router.post('/registerRecord/:idUser',async(req,res)=>{

})
router.get('/getMove/:idRecord',async(req,res)=>{

})
router.get('/getPosition/:idRecord',async(req,res)=>{
    const arm1 = req.body.arm1
    const arm2 = req.body.arm2
    const arm3 = req.body.arm3
    const base = req.body.base
    const head = req.body.head
    
})
router.get('/getRecord/:idUser',async(req,res)=>{

})
module.exports = router