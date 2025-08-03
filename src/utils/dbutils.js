const pool = require('../utils/connection');
const {apiError} = require('./apireturn');


async function getList(options){
    return execute(async function(connection){
        const [rows] = await connection.query(options.query);          
        return list(rows);
    }, options);
}

async function execute(command, options){
    let connection = null;
    try{
        connection = await pool.getConnection(); 
        if(options.transaction){
            await connection.beginTransaction();
            let result = await command(connection);
            await connection.commit();
            return result;
        }
        else{
            return await command(connection);
        }        
    }catch(e){     
        if(connection && options.transaction){
            await connection.rollback();
        }
        return apiError(options.message(e));
    }finally{
        if(connection){
            connection.release();
        }
    }
}

module.exports = {getList}