const express = require('express');
const path = require('path');
const router = express.Router();
const pool = require('../utils/connection');
const {getProdutos, criarProduto, atualizarProduto, getProdutosOptions,getProdutoCategorias,removerProduto,getCategorias,criarCategoria,atualizarCategoria} = require('./produtos.service');


router.get('/', (req, res) =>{   
  res.render('index', {
    titulo: 'SGO - Produtos',  
    link:'./produtos/produtos', 
    libs: ['/produtos/produtos.js'],
    usuario: req.session.user,
    menu:'produtos'
  });
});

router.post('/getProdutoCategorias/', async function(req, res){ 
  const data = await getProdutoCategorias(req.query);
  return res.status(200).json(data);  

});
router.post('/getProdutos/', async function(req, res){ 
  const pageNumber = +req.query.jtStartIndex;
  const pageSize = +req.query.jtPageSize;
  const data = await getProdutos(req.body,pageNumber,pageSize);
  return res.status(200).json(data);
});

router.post('/getCategorias/', async function(req, res){ 
  const pageNumber = +req.query.jtStartIndex;
  const pageSize = +req.query.jtPageSize;
  const data = await getCategorias(pageNumber,pageSize);
  return res.status(200).json(data);
});

router.post('/getProdutosOptions', async function(req, res){    
  
    const produtos = await getProdutosOptions(req.body);
    return res.status(200).json(produtos);  
}
  );


router.post('/criarProduto', async function(req, res){    
  
  const produto = await criarProduto(req.body);
  res.status(200).json(produto);
  
});

router.post('/atualizarProduto', async function(req, res){  
  const produto = await atualizarProduto(req.body);
  res.status(200).json(produto);
});

router.post('/removerProduto', async function (req, res) {
  const { id } = req.body;
  try {
      await removerProduto(id);
      res.status(200).json({ message: 'Produto excluído com sucesso!' });
  } catch (error) {
      res.status(500).json({ error: 'Erro ao excluir produto: ' + error.message });
  }
});

router.post('/criarCategoria', async function(req, res){    
  
  const produto = await criarCategoria(req.body);
  res.status(200).json(produto);
  
});

router.post('/atualizarCategoria', async function(req, res){  
  const produto = await atualizarCategoria(req.body);
  res.status(200).json(produto);
});
module.exports = router;
