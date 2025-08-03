function options(data, interceptor){
    if(interceptor){
        return {Result :'OK', Options:data, interceptor:interceptor};
    }
    return {Result :'OK', Options:data};
}

function create(record){
    return {Result:'OK', Record:record};
}

function update(record){
    return {Result:'OK', Record:record};
}

function remove(){
    return {Result:'OK'};
}

function list(data, total){
    return {Result : "OK", Records : data, TotalRecordCount : total};
}

function apiError(message){
    return {Result : "ERROR", Message : message};
}

module.exports = {
    options,
    create,
    update,
    remove,
    list,
    apiError
}