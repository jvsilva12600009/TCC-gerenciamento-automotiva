

var Agenda = (function(){
    let agenda = {};

    agenda.start = function(){
        createGrid();
        addListeners();
    }

    function addListeners(){
        $('#btn-agenda-pesquisa').off('click').on('click', function(){           
            load();
        }).click();

        

        $('#pesquisa_cliente').keypress(function(event) {
            if (event.which == 13) { // 13 é o código da tecla Enter
                load();
            }
        });


    }

    function load(){
        let values = getFormValues('form-agenda-pesquisa');   
        console.log(values)     
        $('#table-agenda').jtable('load', values);
    }

    function createGrid(){

        $('#table-agenda').jtable({
            title: 'Lista de Agendamentos do Sistema',
            paging: true, 
            pageSize: 10,   
            unAuthorizedRequestRedirectUrl:'/login',    
            actions: {
                listAction: '/agenda/getAgenda',
                createAction: '/agenda/criarAgenda',
                updateAction: '/agenda/atualizarAgenda'
            },            
            fields: {
                idagenda: {
                    title: 'Id',
                    width: '23%',
                    key: true,
                    create: false,
                    edit: false,
                    list: false
                },
                codcliente: {
                    title: 'Cliente',
                    width: '15%',
                    inputClass: 'form-control',
                    options:'../usuarios/getClientes?tipo=0',
                    defaultValue:1   ,
                    display:function(data){
                        return data.record.cliente;
                    }                  
                },
                
                codveiculo: {
                    title: 'Codigo do veiculo',
                    inputClass: 'form-control',
                    dependsOn:'codcliente',
                    width: '15%',
                    options:function(data){
                        console.log(data)
                        return `../veiculos/getVeiculosByCliente?cliente=${data.dependedValues.codcliente}`;
                    }
                     
                },
                datacriacao:{
                    title: 'Data de Criação da agenda',
                    width: '15%',
                     
                    create: false,
                    edit: false,
                    
                },
                dataagendamento: {
                    title: 'Data agendamento',
                    inputClass: 'form-control',
                    type:'date' , 
                    displayFormat: 'dd/mm/yy',                    
                    display: function (data) {
                        return data.record.dataagendamento ;
                    },
                    /*
                    input: function (data) {   
                        let value = data.record ? data.record.dataagendamento : '';                  
                        return $(`<input type="text" class="form-control" name="dataagendamento" id="dataagendamento" value="${value}">`)
                            .datepicker({
                                dateFormat: 'dd/mm/yy', // Date format
                                changeYear: true, // Allow changing year
                                changeMonth: true, // Allow changing month
                                showButtonPanel: true, // Show buttons for today and close
                                onSelect: function (dateText, inst) {
                                    // Set the selected date to the field value
                                    $('#dataagendamento').val(dateText);
                                }
                            });
                    },
                    inputClass: 'validateDate',
                    */
                },
                status:{
                    title:'Status',
                    width: '8%',
                    create: false,
                    inputClass: 'form-control',
                    options:{0:'Inativo', 1:'Ativo'},
                    defaultValue:1
                }
                
            },
            formCreated: function(event, data){
                setDatePicker(data, 'dataagendamento'); 
                data.form.find('input[name=status]').attr('readonly', true); // Impede a digitação manual
    addFormListeners(data);
            },
            formSubmitting: function (event, data) {              
                return data.form.validationEngine('validate');
            }, 
            recordUpdated:function(event, data){
                if(data.serverResponse.Result == 'OK'){
                    load();
                }
            },          
            formClosed: function (event, data) {
                data.form.validationEngine('hide');
                data.form.validationEngine('detach');
            }
        });
        
    }

    return agenda;

})();


Agenda.start();