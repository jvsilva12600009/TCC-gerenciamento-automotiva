const express = require('express');
const path = require('path');
const router = express.Router();
const pool = require('../utils/connection');
const {getAgenda, criarAgenda, atualizarAgenda,getAgendamentobydata,getagendastatus,getAgendamentosPorVeiculo,getAgendamentosPorCliente, getAgendamentos} = require('./agenda.service');
const {list} = require('../utils/apireturn');

router.get('/', (req, res) =>{   
  res.render('index', {
    titulo: 'SGO - Agenda',  
    link:'./agenda/agenda', 
    libs: ['/agenda/agenda.js'],
    usuario: req.session.user,
    menu:'agenda'
  });
});


router.post('/getAgenda/', async function(req, res){  
  const pageNumber = +req.query.jtStartIndex;
  const pageSize = +req.query.jtPageSize;
  const data = await getAgenda(req.body,pageNumber,pageSize);
  return res.status(200).json(data); 
  
});

router.post('/getAgendamentos/', async function(req, res){ 
  const data = await getAgendamentos();
  return res.status(200).json(data);
});

router.get('/getAgendamentobydata/', async function(req, res){ 
  const data = await getAgendamentobydata();
  return res.status(200).json(data);
});

router.get('/getAgendamentosPorVeiculo/', async function(req, res){ 
  const data = await getAgendamentosPorVeiculo();
  return res.status(200).json(data);
});

router.get('/getAgendamentosPorCliente/', async function(req, res){ 
  const data = await getAgendamentosPorCliente();
  return res.status(200).json(data);
});

router.get('/getagendastatus/', async function(req, res){ 
  const data = await getagendastatus();
  return res.status(200).json(data);
});

router.post('/criarAgenda', async function(req, res){    
  
  const agenda = await criarAgenda(req.body);
  res.status(200).json(agenda);
});

router.post('/atualizarAgenda', async function(req, res){  
  const agenda = await atualizarAgenda(req.body);
  res.status(200).json(agenda);
});

module.exports = router;
