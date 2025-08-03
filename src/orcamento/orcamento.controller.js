const express = require('express');
const path = require('path');
const router = express.Router();
const pool = require('../utils/connection');
const {getOrcamento,getOrcamentobyID, criarOrcamento, getdataeorcamento, atualizarOrcamento,getProdutosMaisCaros,getProdutosMaisUtilizados, getUsuariodaAgenda, getProdutos, getAgendaByCodAgenda, getOrcamentoStatus,adicionarProduto, atualizarProduto, deleteProduto,exportarOrcamentoParaPDF } = require('./orcamento.service');
const {list} = require('../utils/apireturn');


router.get('/', (req, res) =>{   
  res.render('index', {
    titulo: 'SGO - Orçamentos',  
    link:'./orcamento/orcamento', 
    libs: ['/orcamento/orcamento.js'],
    usuario: req.session.user,
    menu:'orcamento'
  });
});


router.post('/getOrcamento/', async function(req, res){ 
  const pageNumber = +req.query.jtStartIndex;
  const pageSize = +req.query.jtPageSize;
  const data = await getOrcamento(req.body,pageNumber,pageSize);
  return res.status(200).json(data); 
  
});

router.get('/getOrcamentobyID/', async function(req, res){
  req.body.usuario = req.session.user.id;    
  const data = await getOrcamentobyID(0);
  return res.status(200).json(data); 
});

router.post('/criarOrcamento', async function(req, res){    
  
  req.body.usuario = req.session.user.id;
  const o = await criarOrcamento(req.body);
  res.status(200).json(o);
  
});

router.post('/atualizarOrcamento', async function(req, res){  
  req.body.usuario = req.session.user.id;
  const o = await atualizarOrcamento(req.body);
  res.status(200).json(o);
});


router.post('/getProdutos/', async function(req, res){ 
  const pageNumber = +req.query.jtStartIndex;
  const pageSize = +req.query.jtPageSize;
  const orcamento = +req.query.orcamento
  console.log(req.query)
  const data = await getProdutos(orcamento, pageNumber,pageSize);
  return res.status(200).json(data); 
});


router.post('/adicionarProduto', async function(req, res){ 
  console.log(req.body)
  const o = await adicionarProduto(req.body);
  res.status(200).json(o);
  
});

router.post('/atualizarProduto', async function(req, res){ 
  const o = await atualizarProduto(req.body);
  res.status(200).json(o);
});

router.post('/deleteProduto', async function(req, res){    
  const o = await deleteProduto(req.body.id);
  res.status(200).json(o);
});

router.get('/exportarOrcamentoParaPDF/:idorcamento', async function(req, res) {
  const { idorcamento } = req.params;
  if (!idorcamento) {
    return res.status(400).json({ message: 'ID do orçamento é obrigatório' });
  }
  
  try {
    await exportarOrcamentoParaPDF(idorcamento, res);
  } catch (e) {
    res.status(500).json({ message: `Erro ao exportar orçamento para PDF: ${e.message}` });
  }
});

router.get('/getOrcamentoStatus', async function(req, res){ 
  try {
    const data = await getOrcamentoStatus();
    res.status(200).json(data);
} catch (error) {
    res.status(500).json({ message: `Erro ao obter status de orçamentos: ${error.message}` });
}
  
});

router.get('/getProdutosMaisUtilizados', async function(req, res){ 
  try {
    const data = await getProdutosMaisUtilizados();
    res.status(200).json(data);
} catch (error) {
    res.status(500).json({ message: `Erro ao obter status de orçamentos: ${error.message}` });
}
  
});

router.get('/getProdutosMaisCaros', async function(req, res){ 
  try {
    const data = await getProdutosMaisCaros();
    res.status(200).json(data);
} catch (error) {
    res.status(500).json({ message: `Erro ao obter status de orçamentos: ${error.message}` });
}
  
});

router.get('/getdataeorcamento', async function(req, res){ 
  try {
    const data = await getdataeorcamento();
    res.status(200).json(data);
} catch (error) {
    res.status(500).json({ message: `Erro ao obter status de orçamentos: ${error.message}` });
}
  
});

router.get('/getAgendaByCodAgenda/:codagenda', async function(req, res) {
  const { codagenda } = req.params;
  if (!codagenda) {
    return res.status(400).json({ message: 'Código da agenda é obrigatório' });
  }

  try {
    const data = await getAgendaByCodAgenda(codagenda);
    if (!data) {
      return res.status(404).json({ message: 'Agenda não encontrada' });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ message: `Erro ao obter agenda: ${e.message}` });
  }
});

router.get('/getUsuariodaAgenda/:codagenda', async function(req, res) {
  const { codagenda } = req.params;

  if (!codagenda) {
      return res.status(400).json({ message: 'Código da agenda é obrigatório' });
  }

  try {
      // Chamar a função para obter o usuário da agenda
      const usuario = await getUsuariodaAgenda(codagenda);
      
      if (!usuario) {
          return res.status(404).json({ message: 'Usuário não encontrado para a agenda fornecida' });
      }

      // Retornar o resultado como resposta
      res.status(200).json(usuario);
  } catch (error) {
      // Tratar erros e retornar a resposta de erro
      res.status(500).json({ message: `Erro ao obter usuário da agenda: ${error.message}` });
  }
});





module.exports = router;
