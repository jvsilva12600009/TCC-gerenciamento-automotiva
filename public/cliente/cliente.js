var Cliente = (function(){
    let cliente = {};

    cliente.start = function(){
        createVeiculos();
        
    }

    function createVeiculos(){
        $('#table-veiculos').jtable({
            title: 'Meus Veículos',
            paging: true, 
            pageSize: 10,   
            unAuthorizedRequestRedirectUrl: '/login',    
            actions: {
                listAction: '/cliente/getVeiculos'
            },            
            fields: {
                idveiculo: {
                    title: 'Id',                 
                    key: true,
                    create: false,
                    edit: false,
                    list: false
                },
                codcliente: {type:'hidden'},
                agenda:{
                    title:'Agendamentos',
                    width: '5%',
                    display:function(data){
                        return showAgendamentos(data.record);
                    }
                },
                os:{
                    title:'Ordens de serviço',
                    width: '9%',
                    display:function(data){
                        return showOrdens(data.record.idveiculo);
                    }
                },
                modelo: {
                    title: 'Modelo',
                    inputClass: 'validate[required,maxSize[255]] form-control',
                    width: '15%'
                },
                placa: {                    
                    title: 'Placa',
                    width: '13%'
                },                
                ano: {                   
                    title: 'Ano',
                    width: '15%'               
                },
                cor: {
                    title: 'Cor',                   
                    width: '12%'
                },
                status:{
                    title:'Status',
                    width: '8%',
                    create: false,                   
                    options:{0:'Inativo', 1:'Ativo'},
                    defaultValue:1
                }
            }
        });
        $('#table-veiculos').jtable('load');
    }

    function showAgendamentos(data){

        var $img = $('<span class="fa fa-calendar" style="font-size:1.6em; cursor:pointer" title="Meus Agendamentos">');
        $img.click(function () {
            $('#table-veiculos').jtable('openChildTable',  $img.closest('tr'), 
                {
                    title: 'Meus Agendamentos',
                    paging: true, 
                    pageSize: 10,  
                    actions: {
                        listAction: `/cliente/getAgendamentos?veiculo=${data.idveiculo}`
                    },
                    fields: {
                        idagenda: {
                            title: 'Id',                            
                            key: true,
                            create: false,
                            edit: false,
                            list: false
                        },  
                        orcamento:{
                            title:'Orçamento',
                            width: '2%',
                            display:function(data){
                                return showOrcamentos(data.record);
                            }
                        },    
                        datacriacao: {
                            title: 'Data da Criação',    
                            width: '15%'      
                        },                                    
                        dataagendamento: {
                            title: 'Data do Agendamento',    
                            width: '15%'       
                        },
                        status:{
                            title:'Status',
                            width: '10%',
                            create: false,
                            inputClass: 'form-control',
                            options:{0:'Inativo', 1:'Ativo'},
                            defaultValue:1
                        }
                    }
                },
                function (data) { //opened handler
                    data.childTable.jtable('load');
                });
        });

        return $img;
    }

    function showOrcamentos(data){

        var $img = $('<span class="fa fa-money" style="font-size:1.6em; cursor:pointer" title="Orçamentos">');
        $img.click(function () {
            $('#table-veiculos').jtable('openChildTable',  $img.closest('tr'), 
                {
                    title: 'Meus Orçamentos',
                    paging: true, 
                    pageSize: 10,  
                    actions: {
                        listAction: `/cliente/getOrcamentos?agendamento=${data.idagenda}`
                    },
                    fields: {
                        idorcamento: {
                            title: 'Id',
                            width: '23%',
                            key: true,
                            create: false,
                            edit: false,
                            list: false
                        },
                        produtos: {                
                            title: 'Produtos',
                            list: true,
                            create: false,
                            edit: false,
                            display: function (data){
                                return showProdutos(data.record.idorcamento);
                            }
                        },                        
                        datacriacao:{
                            title: 'Data de Criação do Orçamento',
                            width: '15%'                            
                        },
                        datavalidade:{
                            title: 'Data de Validade do Orçamento',
                            width: '15%'
                        },                       
                        status:{
                            title:'Status',
                            width: '8%',
                            inputClass: 'form-control',
                            create: false,
                            options:{0:'Aguardando Aprovação', 1:'Aprovado', 2:'Reprovado'},
                            defaultValue:1
                        },
                        total:{
                            title:'Valor Total do Orçamento R$',
                            width: '15%',
                            edit: false,
                            create: false,
                            display:function(data){
                                return data.record.total == 0 ?  '' : formatarMoeda(data.record.total);
                            }
                        }
                    }
                },
                function (data) { //opened handler
                    data.childTable.jtable('load');
                });
        });

        return $img;
    }

    function showProdutos(id){

        var $img = $('<span class="fa fa-shopping-basket" style="font-size:1.6em; cursor:pointer" title="Produtos">');
        $img.click(function () {
            $('#table-veiculos').jtable('openChildTable',  $img.closest('tr'), 
                {
                    title: 'Produtos/Serviços Utilizados',
                    paging: true, 
                    pageSize: 10,  
                    actions: {
                        listAction: `/cliente/getProdutos?orcamento=${id}`
                    },
                    fields: {
                        id: {
                            title: 'Id',                            
                            key: true,
                            create: false,
                            edit: false,
                            list: false
                        }, 
                        tipo:{
                            title:'Tipo',
                            width: '10%',
                            display:function(data){
                                return data.record.tipo == 0 ?  'Serviço' : 'Produto';
                            }   
                        },
                        descricao: {
                            title: 'Descrição',    
                            width: '15%'      
                        },                                    
                        quantidade: {
                            title: 'Quantidade',    
                            width: '15%'       
                        },
                        valor: {
                            title: 'Valor',    
                            width: '15%'  ,
                            display:function(data){
                                return data.record.valor == 0 ?  '' : formatarMoeda(data.record.valor);
                            }     
                        }                        
                    }
                },
                function (data) { //opened handler
                    data.childTable.jtable('load');
                });
        });

        return $img;
    }

    function showOrdens(veiculo) {
        var $img = $('<span class="fa fa-cogs" style="font-size:1.6em; cursor:pointer" title="Ordens de Serviço">');
        $img.click(function () {
            $('#table-veiculos').jtable('openChildTable',  $img.closest('tr'), 
                {
                title: 'Lista de Ordens de Serviço do Sistema',
                paging: true,
                pageSize: 10,
                unAuthorizedRequestRedirectUrl:'/login',
                openChildAsAccordion:true,
                actions: {
                    listAction: `/cliente/getordem?veiculo=${veiculo}`
                    
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
                    
                    codagenda: {
                        title: 'Código da Agenda',
                        width: '15%',
                        inputClass: 'form-control',
                        options:'../agenda/getAgendamentos',
                        defaultValue: 1,
                        create: false,
                        edit: false              
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
                        title: 'Código do Executante',
                        width: '15%',
                        inputClass: 'form-control',
                        options: '../usuarios/getClientes?tipo=1',
                        defaultValue: 1                  
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
                        type:'date', 
                        create: false,
                        edit: false,
                        displayFormat: 'dd/mm/yy',                    
                        display: function (data) {
                            return data.record.dataentrada;
                        },
                    },
                    datafim: {
                        title: 'Data de Fim',
                        width: '15%',
                        inputClass: 'validate[required] form-control',
                        type:'date', 
                        create: false,
                        edit: false,
                        displayFormat: 'dd/mm/yy',                    
                        display: function (data) {                        
                            return data.record.datafim;
                        },
                    },
                    dataprevisao: {
                        title: 'Data de Previsão',
                        width: '15%',
                        inputClass: 'validate[required] form-control',
                        type:'date', 
                        create: false,
                        edit: false,
                        displayFormat: 'dd/mm/yy',                    
                        display: function (data) {
                            return data.record.dataprevisao;
                        },
                    },
                    problema: {
                        title: 'Problema',
                        type: 'textarea',
                        width: '15%',
                        create: false,
                        edit: false,
                        inputClass: 'validate[required,maxSize[255]] form-control'
                    },
                    observacao: {
                        title: 'Observação',
                        type: 'textarea',
                        width: '15%',
                        create: false,
                        edit: false,
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
                        create: false,
                        edit: false,
                        inputClass: 'form-control',
                        options:{0:'Aberto', 1:'Executado', 2:'Cancelado'},
                        defaultValue:0
                    },
                },
            },
                function (data) { //opened handler
                    data.childTable.jtable('load');
                });// Carrega a tabela após a configuração
        });
    
        return $img;
    }



    return cliente;

})();


Cliente.start();