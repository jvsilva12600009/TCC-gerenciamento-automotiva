var Veiculos = (function(){
    let veiculos = {};

    veiculos.start = function(){
        createGrid();
        addListeners();
    }

    function addListeners(){
        $('#btn-veiculos-pesquisa').off('click').on('click', function(){           
            load();
        }).click();

        $('#pesquisa_cliente').keypress(function(event) {
            if (event.which == 13) { // 13 é o código da tecla Enter
                load();
            }
        });
    }

    function load(){       
        let filters = getFormValues('form-pesquisa-veiculos');
        $('#table-veiculos').jtable('load', filters);
    }

    function createGrid(){
        $('#table-veiculos').jtable({
            title: 'Lista de Veículos do Sistema',
            paging: true, 
            pageSize: 10,   
            unAuthorizedRequestRedirectUrl: '/login',    
            actions: {
                listAction: '/veiculos/getVeiculos',
                createAction: '/veiculos/criarVeiculos',
                updateAction: '/veiculos/atualizarVeiculos'
            },            
            fields: {
                idveiculo: {
                    title: 'Id',
                    width: '23%',
                    key: true,
                    create: false,
                    edit: false,
                    list: false
                },
                cliente:{type:'hidden'},
                codcliente: {
                    title: 'Código do Cliente',
                    width: '15%',
                    options: `/usuarios/getClientes?tipo=0`,
                    inputClass: 'form-control',
                    defaultValue: 1,
                    display:function(data){
                        return data.record.cliente;
                    }                  
                },
                modelo: {
                    title: 'Modelo',
                    inputClass: 'validate[required,maxSize[255]] form-control',
                    width: '15%'
                },
                placa: {
                    inputClass: 'validate[required,maxSize[7]] form-control',
                    title: 'Placa',
                    width: '13%'
                },
                cor: {
                    title: 'Cor',
                    inputClass: 'validate[required,maxSize[255]] form-control',
                    width: '12%'
                },
                ano: {
                    inputClass: 'validate[required,maxSize[4],minSize[4]] form-control',
                    title: 'Ano',
                    width: '15%'               
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
                data.form.find('input[name=status]').change();
                data.form.validationEngine();
            },
            recordUpdated:function(event, data){
                if(data.serverResponse.Result == 'OK'){
                    load();
                }
            },
            formSubmitting: function (event, data) {              
                return data.form.validationEngine('validate');
            },           
            formClosed: function (event, data) {
                data.form.validationEngine('hide');
                data.form.validationEngine('detach');
            }
        });
    }

    return veiculos;

})();

Veiculos.start();
