const pool = require('../utils/connection');
const execute = require('../utils/db');
const { list, create, update, options } = require('../utils/apireturn');
const moment = require('moment');

async function getAgenda(filtros, pageNumber, pageSize) {
   
    let valores = [filtros.status];
    
    let query = `
        SELECT 
               a.idagenda,
               v.codcliente,
               u.nome cliente,
               a.codveiculo, 
               concat(modelo, ' - ', placa) "veiculo",
               DATE_FORMAT(a.dataagendamento,'%d/%m/%Y') dataagendamento, 
               DATE_FORMAT(a.datacriacao,'%d/%m/%Y') datacriacao,
               a.status
        FROM agenda a
        INNER JOIN veiculos v ON v.idveiculo = a.codveiculo
        INNER JOIN usuarios u ON u.idusuarios = v.codcliente
        WHERE a.status = ?
    `;

    if (filtros.cliente) {
        query += " AND u.nome LIKE CONCAT('%', ?, '%')";
        valores.push(filtros.cliente.toString().trim().toLowerCase());
    }
   
    query += ' ORDER BY dataagendamento LIMIT ?, ?';
    valores.push(pageNumber, pageSize);
    
    return execute(async function (connection) {
        const [rows] = await connection.query(query, valores);
        const [total] = await connection.execute('SELECT count(*) total FROM agenda WHERE status = 1;');
        return list(rows, total[0].total);
    }, {
        message: function (e) {
            return `Erro ao carregar lista de agendas devido a ${e.message}`;
        }
    });
}

async function getAgendamentos(){
    const query = `
                        SELECT a.idagenda AS "Value", 
       CONCAT(v.modelo, ' - ', v.placa) AS "DisplayText"
FROM agenda a
INNER JOIN veiculos v ON v.idveiculo = a.codveiculo
WHERE a.status = 1
    
ORDER BY 2;
        `;
        return execute(async function (connection) {
            const [rows] = await connection.query(query);    
            return options(rows);
        },
            {
                message: function (e) {
                    return `Erro ao carregar agenda devido a ${e.message}`;
                }
            })
    }
    


    async function criarAgenda(agenda) {
        // Convertendo a data para o formato do banco de dados (YYYY-MM-DD)
    const dataagendamento = moment(agenda.dataagendamento, 'DD/MM/YYYY').format('YYYY-MM-DD');

    // Consulta para verificar o status do veículo
    const queryVerificaStatusVeiculo = 'SELECT status FROM veiculos WHERE idveiculo = ?';
    const queryInserirAgenda = 'INSERT INTO agenda (codveiculo, dataagendamento) VALUES (?, ?)';

    return execute(async function (connection) {
        // Verificar o status do veículo
        const [resultStatus] = await connection.query(queryVerificaStatusVeiculo, [agenda.codveiculo]);
        const statusVeiculo = resultStatus[0]?.status;

        // Verifica se o status do veículo é 0 (inativo)
        if (statusVeiculo === 0) {
            throw new Error('Não é possível criar agenda para veículo inativo.');
        }

        // Prossegue com a inserção se o status do veículo for diferente de 0
        const valores = [agenda.codveiculo, dataagendamento];
        const result = await connection.query(queryInserirAgenda, valores); // Execute a query

        agenda.idagenda = result.insertId;
        return create(agenda);
    },
    {
        message: function (e) {
            return e.message || 'Erro ao cadastrar agenda, verifique os campos e tente novamente';
        }
    });
    }
    

    async function atualizarAgenda(agenda) {
        const queryCheckOrcamento = `
            SELECT o.status 
            FROM orcamento o
            INNER JOIN agenda a ON a.idagenda = o.codagenda
            WHERE a.idagenda = ?;
        `;
    
        const queryUpdateAgenda = `
            UPDATE agenda SET 
            codveiculo = ?, 
            dataagendamento = ?, 
            status = ?                 
            WHERE idagenda = ?        
        `;
    
        return execute(async function (connection) {
            // Verifica se a agenda está vinculada a um orçamento com status 0 (ativo)
            const [orcamentoVinculado] = await connection.query(queryCheckOrcamento, [agenda.idagenda]);
    
            if (orcamentoVinculado.length > 0 && orcamentoVinculado[0].status == 0) {
                throw new Error('Não é possível inativar uma agenda vinculada a um orçamento ativo.');
            }
    
            // Se não houver problema, procede com a atualização da agenda
            const dataagendamento = moment(agenda.dataagendamento, 'DD/MM/YYYY').format('YYYY-MM-DD');
            const valores = [agenda.codveiculo, dataagendamento, agenda.status, agenda.idagenda];
            const agend = await connection.query(queryUpdateAgenda, valores); // Executa a query de atualização
    
            return update(agend);
        },
        {
            message: function (e) {
                return `Erro ao atualizar agenda: ${e.message}`;
            }
        });
    }
    



            async function getAgendamentobydata() {
                const query = `
                    SELECT t.total, 
                           CASE 
                               WHEN t.periodo = '01' THEN 'Janeiro'
                               WHEN t.periodo = '02' THEN 'Fevereiro'
                               WHEN t.periodo = '03' THEN 'Março'
                               WHEN t.periodo = '04' THEN 'Abril'
                               WHEN t.periodo = '05' THEN 'Maio'
                               WHEN t.periodo = '06' THEN 'Junho'
                               WHEN t.periodo = '07' THEN 'Julho'
                               WHEN t.periodo = '08' THEN 'Agosto'
                               WHEN t.periodo = '09' THEN 'Setembro'
                               WHEN t.periodo = '10' THEN 'Outubro'
                               WHEN t.periodo = '11' THEN 'Novembro'
                               WHEN t.periodo = '12' THEN 'Dezembro'
                           END as mes
                    FROM (
                        SELECT COUNT(*) total, 
                               DATE_FORMAT(a.dataagendamento, '%m') periodo 
                        FROM agenda a 
                        GROUP BY DATE_FORMAT(a.dataagendamento, '%m')
                    ) as t
                    ORDER BY  t.periodo;
                `;
            
                return execute(async function (connection) {
                    const [rows] = await connection.query(query);
                    return rows;
                }, {
                    message: function (e) {
                        return `Erro ao carregar os dados de agendamentos por data: ${e.message}`;
                    }
                });
            }

            async function getAgendamentosPorCliente() {
                const query = `
                   SELECT 
    u.nome AS cliente,
    COUNT(a.idagenda) AS total_agendamentos
FROM 
    agenda a
INNER JOIN veiculos v ON v.idveiculo = a.codveiculo
INNER JOIN usuarios u ON u.idusuarios = v.codcliente
WHERE 
    a.status = 1  -- Assuming status is in the agenda table
GROUP BY 
    u.nome
ORDER BY 
    total_agendamentos DESC;
                `;
            
                return execute(async function (connection) {
                    const [rows] = await connection.query(query);
                    return rows;
                }, {
                    message: function (e) {
                        return `Erro ao carregar agendamentos por cliente: ${e.message}`;
                    }
                });
            }
            
            async function getAgendamentosPorVeiculo() {
                const query = `
                    SELECT 
                        v.modelo AS veiculo,
                        COUNT(a.idagenda) AS total_agendamentos
                    FROM 
                        agenda a
                    INNER JOIN veiculos v ON v.idveiculo = a.codveiculo
                    GROUP BY 
                        v.modelo
                    ORDER BY 
                        total_agendamentos DESC;
                `;
            
                return execute(async function (connection) {
                    const [rows] = await connection.query(query);
                    return rows;
                }, {
                    message: function (e) {
                        return `Erro ao carregar agendamentos por veículo: ${e.message}`;
                    }
                });
            }
            
            async function getagendastatus() {
                const query = `
                    SELECT 
                        status, 
                        COUNT(*) AS count
                    FROM agenda
                    GROUP BY status;
                `;
                
                return execute(async function (connection) {
                    const [rows] = await connection.query(query);
                    
                    const total = rows.reduce((sum, row) => sum + row.count, 0);
                    const statusMap = {
                        0: 'Inativo ',
                        1: 'Ativo'
                        
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
            
async function removeragenda(id){}



module.exports = { 
    getAgenda,
    criarAgenda,
    getAgendamentosPorCliente,
    getAgendamentobydata,
    getagendastatus,
    getAgendamentosPorVeiculo,
    atualizarAgenda, 
    removeragenda,
    getAgendamentos
                  }