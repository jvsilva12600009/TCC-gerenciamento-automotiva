
function validateResponse(response){
    if(response.status == '401'){
        window.location.replace("/login");
    }
}


function getFormValues(formName) {
    let values = {};
    Array.from($(`#${formName} .form-control`)).forEach(control =>{
        values[control.name] = control.value;
    });
    return values;
}


function formatarMoeda(valor){
    if(valor){
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor.toString().replace(',','.'));
    }
    return '';
}

function setDatePicker(data, campo){ 
    let validade = $(`input[name=${campo}]`);
    validade.attr('readonly', true);  // Impede a digitação manual

    if (data.formType == 'edit' && data.record[campo]) {
        let d = new Date(data.record[campo].split('/').reverse().join('/'));                    
        validade.datepicker('option', 'minDate', d);
        validade.datepicker('setDate', d);
    } else {
        validade.datepicker('option', 'minDate', 0);
    }
}

/*
function setDatePicker(data, campo){

    let validade = $(`input[name=${campo}]`);
    if (data.formType == 'edit') {
        let d = new Date(data.record[campo].split('/').reverse().join('/'));                    
        validade.datepicker('option', 'minDate', d);
        validade.datepicker('setDate', d);
        
    } else {
        validade.datepicker('option', 'minDate', 0);
    }

}*/


function http(url, onLoad){
    fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
        },
    })
       .then(response => response.json())
       .then(response => onLoad(response))

}

function fillCombo(controle, options, selected){

    var el = $(`#${controle}`);
    el.empty();
    options.forEach( o =>{        
        if(o.Value == selected){
            el.append($(`<option value="${o.Value}" selected="selected">${o.DisplayText}</option>`));
        }else{
            el.append($(`<option value="${o.Value}" >${o.DisplayText}</option>`));
        }
    });
}