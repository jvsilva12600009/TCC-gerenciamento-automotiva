const pool = require('../utils/connection');
const execute = require('../utils/db');
const { list, create, update, options, remove } = require('../utils/apireturn');


async function getVeiculos(cliente, pageNumber, pageSize) {
   
    let valores = [cliente];    
    let query = `
        SELECT v.idveiculo,
               v.codcliente,
               v.placa,
               v.modelo,
               v.ano,
               v.cor,
               v.status
        FROM veiculos v
        INNER JOIN usuarios u 
            ON u.idusuarios = v.codcliente
        where v.codcliente = ?
    `;
    query += ' ORDER BY ano LIMIT ?, ?';
    valores.push(pageNumber, pageSize);
    
    return execute(async function (connection) {
        const [rows] = await connection.query(query, valores);
        const [total] = await connection.execute('SELECT count(*) total FROM veiculos WHERE codcliente =?;', valores);
        return list(rows, total[0].total);
    }, {
        message: function (e) {
            return `Erro ao carregar veiculos devido a ${e.message}`;
        }
    });
}

async function getAgendamentos(veiculo, pageNumber, pageSize) {
   
    let valores = [veiculo];
    
    let query = `
        SELECT a.idagenda,               
               a.codveiculo,
               DATE_FORMAT(a.dataagendamento,'%d/%m/%Y') dataagendamento, 
               DATE_FORMAT(a.datacriacao,'%d/%m/%Y') datacriacao,
               a.status
        FROM agenda a       
        WHERE a.codveiculo = ?
    `;

    query += ' ORDER BY dataagendamento LIMIT ?, ?';
    valores.push(pageNumber, pageSize);
    
    return execute(async function (connection) {
        const [rows] = await connection.query(query, valores);
        const [total] = await connection.execute('SELECT count(*) total FROM agenda WHERE codveiculo = ?;', [veiculo]);
        return list(rows, total[0].total);
    }, {
        message: function (e) {
            return `Erro ao carregar agendamentos devido a ${e.message}`;
        }
    });
}

async function getOrcamentos(agendamento, pageNumber, pageSize) {
    
    let valores = [agendamento];
    
    let query = `
        SELECT  o.idorcamento,
                o.codagenda,               
                date_format(o.datavalidade, '%d/%m/%Y') datavalidade, 
                date_format(o.datacriacao, '%d/%m/%Y') datacriacao, 
                o.status,
                ifnull(p.total, 0) total
            FROM orcamento o                
            left join (
            select sum(p.valor * p.quantidade) total, 
            codorcamento 
        from orcamento_produtos p 
            group by codorcamento                 
            ) p
            on p.codorcamento = o.idorcamento   
            WHERE o.codagenda = ?
    `;

    query += ' ORDER BY datavalidade LIMIT ?, ?';
    valores.push(pageNumber, pageSize);
    
    return execute(async function (connection) {
        const [rows] = await connection.query(query, valores);
        const [total] = await connection.execute('SELECT count(*) total FROM orcamento WHERE codagenda = ?;', [agendamento]);
        return list(rows, total[0].total);
    }, {
        message: function (e) {
            return `Erro ao carregar orçamento devido a ${e.message}`;
        }
    });
}

async function getprodutos(orcamento, pageNumber, pageSize) {   
    let valores = [orcamento];    
    let query = `
                select op.id,
                    p.descricao,
                    op.quantidade,
                    op.valor,
                    p.tipo
                from orcamento_produtos op
                inner join produtos p
                on p.idproduto = op.codproduto
                where op.codorcamento = ?
    `;

    query += ' order by  (op.quantidade * op.valor) desc LIMIT ?, ?';
    valores.push(pageNumber, pageSize);
    
    return execute(async function (connection) {
        const [rows] = await connection.query(query, valores);
        const [total] = await connection.execute('SELECT count(*) total FROM orcamento_produtos WHERE codorcamento = ?;', [orcamento]);
        return list(rows, total[0].total);
    }, {
        message: function (e) {
            return `Erro ao carregar produtos devido a ${e.message}`;
        }
    });
}

async function getordem(veiculo, pageNumber, pageSize) {   
    let valores = [veiculo];   
    
    let query = `
                 SELECT 
            o.id_os,
            o.codagenda,
            o.codorcamento,
            date_format(o.datacriacao, '%d/%m/%Y') datacriacao,  
            date_format(o.dataentrada, '%d/%m/%Y') dataentrada,  
            date_format(o.datafim, '%d/%m/%Y') datafim,  
            date_format(o.dataprevisao, '%d/%m/%Y') dataprevisao,   
            o.problema, 
            o.observacao,
            o.km,
            o.status,
            o.codexecutante
        FROM os o       
            INNER JOIN agenda a ON a.idagenda = o.codagenda
            INNER JOIN orcamento r ON r.idorcamento = o.codorcamento
           
            inner join veiculos v on v.idveiculo  = a.codveiculo
             left JOIN usuarios u ON u.idusuarios = o.codexecutante
            where v.idveiculo= ?
    `;

    query += ' ORDER BY o.datacriacao DESC LIMIT ?, ? ';
    valores.push(pageNumber, pageSize);
    
    return execute(async function (connection) {
        const [rows] = await connection.query(query, valores);
        const [total] = await connection.execute(`  SELECT count(*) total FROM os o  
                                                    INNER JOIN agenda a 
                                                    ON a.idagenda = o.codagenda 
                                                    where a.codveiculo= ? `,[veiculo]);
        
        console.log(total)
                 return list(rows, total[0].total);
    }, {
        message: function (e) {
         
            return `Erro ao carregar produtos devido a ${e.message}`;
          
        }
    });
}


module.exports = { 
    getVeiculos,
    getAgendamentos,
    getOrcamentos,
    getordem,
    getprodutos
                  }