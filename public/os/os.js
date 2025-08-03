var Agenda = (function(){
    let agenda = {};

    agenda.start = function(){
        createGrid();
        addListeners();
    }

    function addListeners(){
        $('#btn-pesquisa-os').off('click').on('click', function(){           
            load();
        }).click();

        $('#pesquisa_agenda').keypress(function(event) {
            if (event.which == 13) { // 13 é o código da tecla Enter
                load();
            }
        });
    }

    function load(){
        let filters = getFormValues('form-pesquisa-os');       
        $('#table-os').jtable('load', filters);
    }

    function showprodutos(id){
        var $img = $('<span class="fa fa-shopping-basket" style="font-size:1.6em; cursor:pointer" title="Produtos" />');
        
        $img.click(function () {
            $('#table-os').jtable('openChildTable',
                $img.closest('tr'), {
                    title: 'Lista de Produtos do orçamento',
                    paging: true, 
                    pageSize: 10,                     
                    actions: {
                        listAction: `/orcamento/getProdutos?orcamento=${id}`
                    },
                    fields: {
                        id: {
                            title: 'Id',
                            width: '23%',
                            key: true,
                            create: false,
                            edit: false,
                            list: false
                        }, 
                        nomeproduto:{type:'hidden'},
                        codproduto: {
                            title: 'Código do Produto',
                            width: '23%',
                            options: '../produtos/getProdutosOptions',
                            inputClass: 'form-control',
                            defaultValue: 0,
                            display:function(data){
                                return data.record.nomeproduto;
                            }
                        },
                        quantidade: {
                            title: 'Quantidade',
                            width: '15%'     
                        }
                    }
                }, function (data) {
                    data.childTable.jtable('load');
                });
        });
        
        return $img;
    }

    function createGrid(){
        $('#table-os').jtable({
            title: 'Lista de Ordens de Serviço do Sistema',
            paging: true,
            pageSize: 10,
            unAuthorizedRequestRedirectUrl:'/login',
            openChildAsAccordion:true,
            actions: {
                listAction: '/os/getos',
               // createAction: '/os/criaros',
                updateAction: '/os/atualizaros'
            },
            fields: {
                id_os: {
                    title: 'Id',
                    width: '23%',
                    key: true,
                    create: false,
                    edit: false,
                    list: false,
                },
                nomeproduto:{type:'hidden'},
                     
                produtos: {                
                    title: 'Produtos',
                    width: '5%',
                    list: true,
                    create: false,
                    edit: false,
                    display: function (data){
                        return showprodutos(data.record.codorcamento);
                    }
                },
                agenda:{type:'hidden', create:false, edit:false},
                codagenda: {
                    title: 'Código da Agenda',
                    width: '15%',
                    inputClass: 'form-control',
                    options:'../agenda/getAgendamentos',
                    defaultValue: 1    ,
                    create: false,
                    edit: false,
                    display:function(data){
                        return data.record.agenda;
                    }              
                },
                codorcamento: {
                    title: 'Código do Orçamento',
                    inputClass: 'form-control',
                    width: '15%',
                    edit: false,
                    list: false,
                    create: false
                },
                codexecutante: {
                    title: 'Executante',
                    width: '15%',
                    inputClass: 'form-control',
                    options: '../usuarios/getClientes?tipo=1',
                    defaultValue: 1,
                    display: function (data) {
                        if (!data.record.cliente) {
                            return '';  // Se o executante for nulo, não exibe nada
                        }
                        // Verifica se o executante está ativo (status_ativo: 1) ou inativo (status_ativo: 0)
                        let statusIcon = data.record.statususuario == 1
                            ? '<span style="color: green;" title="Tecnico Ativo">●</span>' // Bolinha verde para ativo
                            : '<span style="color: red;" title="Tecnico Inativo">●</span>';  // Bolinha vermelha para inativo
                        
                        // Retorna o nome do executante precedido pela bolinha
                        return statusIcon + ' ' + data.record.cliente;
    }           
                },
                datacriacao:{
                    title: 'Data de Criação',
                    width: '22%',                     
                    create: false,
                    edit: false,
                    
                },
                dataentrada: {
                    title: 'Data de Entrada',
                    width: '15%',
                    inputClass: 'validate[required] form-control',
                    type:'date' , 
                    displayFormat: 'dd/mm/yy',                    
                    display: function (data) {
                        return data.record.dataentrada ;
                    },
                },
                datafim: {
                    title: 'Data de Fim',
                    width: '15%',
                    inputClass: 'validate[required] form-control',
                    type:'date' , 
                    create: false,
                    edit: false,
                    displayFormat: 'dd/mm/yy',                    
                    display: function (data) {                        
                        return data.record.datafim ;
                    },
                },
                dataprevisao: {
                    title: 'Data de Previsão',
                    width: '15%',
                    inputClass: 'validate[required] form-control',
                    type:'date' , 
                    displayFormat: 'dd/mm/yy',                    
                    display: function (data) {
                        return data.record.dataprevisao ;
                    },
                },
                problema: {
                    title: 'Problema',
                    type: 'textarea',
                    width: '15%',
                    inputClass: 'validate[required,maxSize[255]] form-control'
                },
                observacao: {
                    title: 'Observação',
                    type: 'textarea',
                    width: '15%',
                    inputClass: 'validate[required,maxSize[255]] form-control'
                },
                km: {
                    title: 'Kilometragem',
                    width: '15%',
                    inputClass: 'validate[required,custom[number]] form-control'
                },
                status:{
                    title:'Status',
                    width: '8%',
                    inputClass: 'form-control',
                    options:{0:'Aberto', 1:'Executado', 2:'Cancelado'},
                    defaultValue:0
                    
                }
            },
            
            formCreated: function(event, data) {    
                // Aqui você pode definir regras de validação ou máscaras de campos            
                data.form.validationEngine();
                setDatePicker(data, 'dataentrada');               
                setDatePicker(data, 'dataprevisao');
                
            },
            recordUpdated:function(event, data){
                if(data.serverResponse.Result == 'OK'){
                    load();
                }
            },
            formSubmitting: function (event, data) {
                // Validação do formulário ao submeter
                return data.form.validationEngine('validate');
            },
            formClosed: function (event, data) {
                data.form.validationEngine('hide');
                data.form.validationEngine('detach');
            },
            recordsLoaded: function (event, data) {
                data.records.forEach(function (record, index) {
                    if (record.status == 1 || record.status == 2) {
                        // Esconde o botão de edição para esta linha
                        var $row = $('#table-os').jtable('getRowByKey', record.id_os);
                        $row.find('.jtable-edit-command-button').hide();
                    }
                });
            }
        });
    }

    return agenda;
})();

Agenda.start();
