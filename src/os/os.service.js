const pool = require('../utils/connection');
const execute = require('../utils/db');
const { list, create, update, options } = require('../utils/apireturn');
const moment = require('moment');

async function getos(filtros, pageNumber, pageSize) {

    let query = `
        SELECT 
            o.id_os,
            o.codagenda,
            o.codorcamento,
            u.nome cliente,
            date_format(o.datacriacao, '%d/%m/%Y') datacriacao,  
            date_format(o.dataentrada, '%d/%m/%Y') dataentrada,  
            date_format(o.datafim, '%d/%m/%Y') datafim,  
            date_format(o.dataprevisao, '%d/%m/%Y') dataprevisao,   
            concat(v.modelo,' - ', v.placa) "agenda"  ,
            o.problema, 
            o.observacao,
            o.km,
            o.status,
            u.status statususuario,
            o.codexecutante
        FROM os o       
            INNER JOIN agenda a ON a.idagenda = o.codagenda
            INNER JOIN orcamento r ON r.idorcamento = o.codorcamento
            left JOIN usuarios u ON u.idusuarios = o.codexecutante
            inner join veiculos v on v.idveiculo  = a.codveiculo
            where o.status=?
    `;
    let parametros = [filtros.status];
    let conditions = [];
    console.log("filtros",filtros)
    if (filtros.agendacodigo) {

        conditions.push("( lower(v.placa) = ? or  lower(v.modelo) = ? )");
        parametros.push(filtros.agendacodigo.toString().trim().toLowerCase(), filtros.agendacodigo.toString().trim().toLowerCase());
    }
    if (filtros.codorcamento) {

        conditions.push("( r.idorcamento=? )");
        parametros.push(filtros.codorcamento);
    }
    if (filtros.executantecodigo) {

        conditions.push("( lower(u.nome)  like CONCAT('%', ?, '%') )");
        parametros.push(filtros.executantecodigo.toString().trim().toLowerCase());
    }
    if (conditions.length > 0) {
        query += " where  " + conditions.join(" AND ");
    }
        console.log(conditions)
        parametros.push(pageNumber);
        parametros.push(pageSize);

        query += ` ORDER BY o.id_os LIMIT ?, ? `;
        return execute(async function (connection) {
            const [rows] = await connection.query(query, parametros);
            const [total] = await connection.execute('SELECT count(*) total FROM os WHERE status = 1;');
            return list(rows, total[0].total);
        }, {
        message: function (e) {
            return `Erro ao carregar lista de OS devido a ${e.message}`;
        }
    });
}



async function criaros(os){
    // Convertendo as datas para o formato do banco de dados (YYYY-MM-DD )
    const dataentrada = moment(os.dataentrada, 'DD/MM/YYYY ').format('YYYY-MM-DD ');
    const datafim = moment(os.datafim, 'DD/MM/YYYY ').format('YYYY-MM-DD ');
    const dataprevisao = moment(os.dataprevisao, 'DD/MM/YYYY ').format('YYYY-MM-DD ');
    
    const query = 'INSERT INTO os (codagenda, codorcamento, dataentrada, datafim, dataprevisao, problema, observacao, km, status, codexecutante) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    return execute(async function (connection) {               
        const parametros = [os.codagenda, os.codorcamento, dataentrada, datafim, dataprevisao, os.problema, os.observacao, os.km, os.status, os.codexecutante];
        const result = await connection.query(query, parametros); // Execute a query   
       
        os.id_os = result.insertId;   
        return create(os);
    },
    {
        message: function (e) {
            return 'Erro ao cadastrar ordem de serviço, verifique os campos e tente novamente';
        }
    });    
}
async function atualizaros(os) {
    
    // Converte as datas para o formato YYYY-MM-DD
    const dataEntradaFormatada = moment(os.dataentrada, 'DD/MM/YYYY').format('YYYY-MM-DD');
    const dataPrevisaoFormatada = moment(os.dataprevisao, 'DD/MM/YYYY').format('YYYY-MM-DD');

    // Verificação se a data de entrada é maior que a data de previsão ou vice-versa
    if (moment(dataEntradaFormatada).isAfter(dataPrevisaoFormatada)) {
        return {
            Result: 'ERROR',
            Message: 'A data de entrada não pode ser maior que a data de previsão'
        };
    }

    const query = `
        UPDATE os SET 
            dataentrada = ?,            
            dataprevisao = ?, 
            problema = ?, 
            observacao = ?, 
            km = ?, 
            status = ?, 
            codexecutante = ?,
            datafim = (CASE WHEN ? != 0 THEN
                CURRENT_DATE()                
            ELSE 
                NULL
            END)
        WHERE id_os = ?            
    `;
    
    let valores = [
        dataEntradaFormatada,
        dataPrevisaoFormatada,
        os.problema,
        os.observacao, 
        os.km, 
        os.status, 
        os.codexecutante, 
        os.status, 
        os.id_os
    ];

    console.log(valores);
    
    return execute(async function (connection) {        
        const result = await connection.query(query, valores); 
        return update(os);
    }, {
        message: function (e) {
            return 'Erro ao atualizar ordem de serviço, verifique os campos e tente novamente';
        }
    });
}

async function getOSStatus() {
    const query = `
        SELECT 
            status, 
            COUNT(*) AS count
        FROM os
        GROUP BY status;
    `;
    
    return execute(async function (connection) {
        const [rows] = await connection.query(query);
        
        const total = rows.reduce((sum, row) => sum + row.count, 0);
        const statusMap = {
            0: 'Aberto ',
            1: 'Executado',
            2: 'Cancelado' // Caso haja um status 2 para pendente
        };

        const percentages = rows.map(row => ({
            status: statusMap[row.status],  // Mapeia status numérico para texto
            percentage: ((row.count / total) * 100).toFixed(2)
        }));

        return percentages;
    }, {
        message: function (e) {
            return `Erro ao carregar status de orçamentos: ${e.message}`;
        }
    });
}

async function getExecutanteOS() {
    const query = `
        SELECT 
            u.nome AS executante,
            COUNT(o.id_os) AS total_ordens
        FROM os o
        LEFT JOIN usuarios u ON u.idusuarios = o.codexecutante
        
        GROUP BY u.nome
        ORDER BY total_ordens DESC;
    `;

    return execute(async function (connection) {
        const [rows] = await connection.query(query ); // Você pode definir o 'status' na chamada da função
        return rows;
    }, {
        message: function (e) {
            return `Erro ao carregar os executantes: ${e.message}`;
        }
    });
}

async function getExecutanteOSRADAR() {
    const query = `
      SELECT 
    u.nome as executante,
    COUNT(*) AS total_os
FROM os o
LEFT JOIN usuarios u ON u.idusuarios = o.codexecutante
GROUP BY u.nome;
    `;

    return execute(async function (connection) {
        const [rows] = await connection.query(query ); // Você pode definir o 'status' na chamada da função
        return rows;
    }, {
        message: function (e) {
            return `Erro ao carregar os executantes: ${e.message}`;
        }
    });
}

async function getdataeOS() {
    const query = `
        SELECT 
    date_format(o.datacriacao, '%d/%m/%Y') as criacao_dia, 
    COUNT(*) AS total_os
FROM os o
GROUP BY criacao_dia
ORDER BY criacao_dia;
    `;

    return execute(async function (connection) {
        const [rows] = await connection.query(query ); // Você pode definir o 'status' na chamada da função
        return rows;
    }, {
        message: function (e) {
            return `Erro ao carregar os executantes: ${e.message}`;
        }
    });
}

module.exports = { 
    getos,
    getOSStatus,
    getdataeOS,
    criaros,
    getExecutanteOSRADAR,
    getExecutanteOS,
    atualizaros
   
                  }