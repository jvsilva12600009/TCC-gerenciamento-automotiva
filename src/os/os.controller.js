const express = require('express');
const path = require('path');
const router = express.Router();
const pool = require('../utils/connection');
const {getos, criaros, atualizaros,getOSStatus,getdataeOS,getExecutanteOS,getExecutanteOSRADAR} = require('./os.service');
const {list} = require('../utils/apireturn');

router.get('/', (req, res) =>{   
  res.render('index', {
    titulo: 'SGO - Ordem de Serviço',  
    link:'./os/os', 
    libs: ['/os/os.js'],
    usuario: req.session.user,
    menu:'os'
  });
});

router.post('/getos/', async function(req, res){ 
  const pageNumber = +req.query.jtStartIndex;
  const pageSize = +req.query.jtPageSize;
  const data = await getos(req.body,pageNumber,pageSize);
  return res.status(200).json(data);
});



router.post('/criaros', async function(req, res){    
  req.body.usuario = req.session.user.id;
  const os = await criaros(req.body);
  res.status(200).json(os);
});

router.post('/atualizaros', async function(req, res){  
  req.body.usuario = req.session.user.id;
  const os = await atualizaros(req.body);
  res.status(200).json(os);
});

router.get('/getOSStatus', async function(req, res){ 
  try {
    const data = await getOSStatus();
    res.status(200).json(data);
} catch (error) {
    res.status(500).json({ message: `Erro ao obter status de orçamentos: ${error.message}` });
}
  
});

router.get('/getdataeOS', async function(req, res){ 
  try {
    const data = await getdataeOS();
    res.status(200).json(data);
} catch (error) {
    res.status(500).json({ message: `Erro ao obter status de orçamentos: ${error.message}` });
}
  
});

router.get('/getExecutanteOS', async function(req, res){ 
  try {
    const data = await getExecutanteOS();
    res.status(200).json(data);
} catch (error) {
    res.status(500).json({ message: `Erro ao obter status de orçamentos: ${error.message}` });
}
  
});

router.get('/getExecutanteOSRADAR', async function(req, res){ 
  try {
    const data = await getExecutanteOSRADAR();
    res.status(200).json(data);
} catch (error) {
    res.status(500).json({ message: `Erro ao obter status de orçamentos: ${error.message}` });
}
  
});
module.exports = router;