const express = require('express');
const router = express.Router();
const path = require('path');
const { list } = require('../utils/apireturn');
const { getVeiculos,  getAgendamentos,  getOrcamentos,  getprodutos, getordem } = require('./cliente.service');

router.get('/', async (req, res) => {   
  try {
    res.render('index', {
      titulo: 'SGO - Sistema de Gerenciamento de Oficinas',  
      link: './cliente/cliente', 
      libs: ['/cliente/cliente.js'],
      usuario: req.session.user,
      menu: ''
      //orcamentoStatus // Passando os dados para a view
    });
  } catch (error) {
    res.status(500).send('Erro ao carregar status dos clientes');
  }
});

router.post('/getVeiculos/', async function(req, res){ 
  const pageNumber = +req.query.jtStartIndex;
  const pageSize = +req.query.jtPageSize;  
  const data = await getVeiculos(req.session.user.id,pageNumber,pageSize);
  return res.status(200).json(data); 
  
});

router.post('/getAgendamentos/', async function(req, res){ 
  const pageNumber = +req.query.jtStartIndex;
  const pageSize = +req.query.jtPageSize;  
  const veiculo = +req.query.veiculo; 
  const data = await getAgendamentos(veiculo,pageNumber,pageSize);
  return res.status(200).json(data);   
});

router.post('/getOrcamentos/', async function(req, res){ 
  const pageNumber = +req.query.jtStartIndex;
  const pageSize = +req.query.jtPageSize;  
  const agendamento = +req.query.agendamento; 
  const data = await getOrcamentos(agendamento,pageNumber,pageSize);
  return res.status(200).json(data); 
  
});

router.post('/getProdutos/', async function(req, res){ 
  const pageNumber = +req.query.jtStartIndex;
  const pageSize = +req.query.jtPageSize;  
  const orcamento = +req.query.orcamento; 
  const data = await getprodutos(orcamento,pageNumber,pageSize);
  return res.status(200).json(data); 
  
});

router.post('/getordem/', async function(req, res){ 
  const pageNumber = +req.query.jtStartIndex;
  const pageSize = +req.query.jtPageSize;  
  const veiculo = +req.query.veiculo; 
  console.log("teste123", veiculo)
  const data = await getordem(veiculo,pageNumber,pageSize);
  return res.status(200).json(data); 
  
});


module.exports = router;
