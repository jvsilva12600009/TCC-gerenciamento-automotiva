// veiculos_controller.js

const express = require('express');
const router = express.Router();
const { getVeiculos, criarVeiculos, atualizarVeiculos, getVeiculosByCliente, removerVeiculo } = require('./veiculos.service');

router.get('/', (req, res) => {
    res.render('index', {
        titulo: 'SGO - Veiculos',  
        link: './veiculos/veiculos', 
        libs: ['/veiculos/veiculos.js'],
        menu: 'veiculos',
        usuario: req.session.user
    });
});

router.post('/getVeiculos/', async function(req, res){  
    const pageNumber = +req.query.jtStartIndex || 0;
    const pageSize = +req.query.jtPageSize || 10;   
    const data = await getVeiculos(Object.assign(req.body, req.query), pageNumber, pageSize);  
    return res.status(200).json(data);
});

router.post('/getVeiculosByCliente/', async function(req, res){  
    const data = await getVeiculosByCliente(req.query.cliente);  
    return res.status(200).json(data);
});

router.post('/criarVeiculos', async function(req, res){    
    const v = await criarVeiculos(req.body);
    res.status(200).json(v);
});

router.post('/atualizarVeiculos', async function(req, res){ 
    const v = await atualizarVeiculos(req.body);
    res.status(200).json(v);
});

router.post('/removerVeiculo', async function(req, res){
    const idVeiculo = req.body.id;
    const result = await removerVeiculo(idVeiculo);
    if (result.success) {
        res.status(200).json({ message: 'Veículo excluído com sucesso!' });
    } else {
        res.status(500).json({ message: 'Erro ao excluir veículo.' });
    }
});

module.exports = router;
