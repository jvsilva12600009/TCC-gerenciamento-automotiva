const pool = require('../utils/connection');
const execute = require('../utils/db');
const { list, create, update, options } = require('../utils/apireturn');

async function getVeiculos(filtros, pageNumber, pageSize) {
    let query = `
        SELECT SQL_CALC_FOUND_ROWS
               v.idveiculo,
               v.codcliente,
               u.nome cliente,
               v.placa,
               v.modelo,
               v.ano,
               v.cor,
               v.status
        FROM veiculos v
        INNER JOIN usuarios u ON u.idusuarios = v.codcliente
        where v.status =?
    `;
    let valores = [filtros.status == undefined ? 1 : filtros.status ];
    let colunas = [];



    if (filtros.id){
    colunas.push("codcliente=? ");
    valores.push(filtros.id);
}
    if (filtros.cliente) {
        colunas.push("lower(u.nome) LIKE CONCAT('%', ?, '%')");
        valores.push(filtros.cliente.toString().trim().toLowerCase());
    }
    if(filtros.placa){

        colunas.push("lower(v.placa) LIKE CONCAT('%', ?, '%')");
        valores.push(filtros.placa.toString().trim().toLowerCase());
    }
    if(filtros.modelo){

        colunas.push("lower(v.modelo) LIKE CONCAT('%', ?, '%')");
        valores.push(filtros.modelo.toString().trim().toLowerCase());
    }
    if (colunas.length > 0) {
        query += " and  " + colunas.join(" AND ");
    }

    query += ' ORDER BY v.idveiculo LIMIT ?, ?';

    valores.push(pageNumber, pageSize);
   console.log(query,valores,colunas);
    return execute(async function (connection) {
        const [rows] = await connection.query(query, valores);
        const [total] = await connection.execute('SELECT FOUND_ROWS() AS total_rows;');
        return list(rows, total[0].total_rows);
    }, {
        message: function (e) {
            return `Erro ao carregar lista de veículos devido a ${e.message}`;
        }
    });
}

async function criarVeiculos(veiculos){
    return execute(async function (connection) { 
        const query = `INSERT INTO veiculos (modelo, placa, cor, ano, codcliente) 
                       VALUES (?, ?, ?, ?, ?)`;
        const parametros = [
            veiculos.modelo, 
            veiculos.placa, 
            veiculos.cor, 
            veiculos.ano, 
            veiculos.codcliente,
             
        ]; 
        const [result] = await connection.query(query, parametros); 
        veiculos.idveiculo = result.insertId;   
        return create(veiculos);
    },
    {
        message: function (e) {
            return 'Erro ao cadastrar veículo, verifique os campos e tente novamente';
        }
    })
}

async function atualizarVeiculos(veiculos) {
    return execute(async function (connection) {
        // Verificar se o veículo está associado a uma agenda ativa (status = 1)
        const queryAgendaAtiva = `
            SELECT a.idagenda
            FROM agenda a
            WHERE a.codveiculo = ? AND a.status = 1
        `;

        // Executa a consulta para verificar agendas ativas
        const [agendasAtivas] = await connection.query(queryAgendaAtiva, [veiculos.idveiculo]);

        // Se existir uma agenda ativa, bloquear a inativação (veiculos.status = 0)
        if (agendasAtivas.length > 0 && veiculos.status == 0) {
            throw new Error('Veículo não pode ser inativado, pois está associado a uma agenda ativa.');
        }

        // Atualizar o veículo se não houver agendas ativas ou se o status não for 0
        const queryUpdateVeiculo = `
            UPDATE veiculos SET 
            modelo = ?, 
            placa = ?, 
            cor = ?, 
            ano = ?, 
            codcliente = ?, 
            status = ? 
            WHERE idveiculo = ?
        `;
        const parametros = [
            veiculos.modelo,
            veiculos.placa,
            veiculos.cor,
            veiculos.ano,
            veiculos.codcliente,
            veiculos.status,
            veiculos.idveiculo
        ];

        await connection.query(queryUpdateVeiculo, parametros);

        return update(veiculos);
    }, {
        message: function (e) {
            if (e.message === 'Veículo não pode ser inativado, pois está associado a uma agenda ativa.') {
                return e.message;
            }
            return 'Erro ao atualizar veículo, verifique os campos e tente novamente';
        }
    });
}

async function removerveiculos(id){
    return execute(async function (connection) {
        const query = 'DELETE FROM veiculos WHERE idveiculo = ?';
        await connection.query(query, [id]);
        return { success: true };
    },
    {
        message: function (e) {
            return 'Erro ao remover veículo, tente novamente';
        }
    });
}

async function getVeiculosByCliente(cliente) {
    const query = `
        select idveiculo "Value", 
               concat(modelo, ' - ', placa, ' (', 
               case when status = 1 then 'Ativo' else 'Inativo' end, ')') "DisplayText"
        from veiculos 
        where codcliente = ? 
        order by placa
    `;

    return execute(async function(connection){
        const [rows] = await connection.query(query, [cliente]); 
        return options(rows);
    }, 
    {
        message: function (e) {
            return 'Erro ao buscar veículos do cliente';
        }
    });
}

module.exports = { 
    getVeiculos,
    getVeiculosByCliente,
    criarVeiculos,
    atualizarVeiculos, 
    removerveiculos
}
