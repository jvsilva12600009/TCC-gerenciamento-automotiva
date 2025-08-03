var Agenda = (function(){
    let agenda = {};
    let _categorias = [];

    agenda.start = function(){
        createGrid();
        addListeners();
        createDialog();
        createCategorias();
        loadFilters();
    }

    function createDialog(){
        $( "#dialog_categorias" ).dialog({
            autoOpen: false,  
            title:'Categorias de Produtos',          
            width: '50%',
            modal: true            
          });
    }

    function createCategorias(){
        $('#table_categorias').jtable({
            title: 'Categorias de Produtos',
            paging: true,
            pageSize: 10,
            unAuthorizedRequestRedirectUrl: '/login',
            actions: {
                listAction: '/produtos/getCategorias',
                createAction: '/produtos/criarCategoria',
                updateAction: '/produtos/atualizarCategoria'
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
                descricao: {
                    title: 'Descrição',
                    inputClass: 'validate[required,maxSize[255]] form-control'
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
                data.form.validationEngine();
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

    function addListeners(){
        $('#btn-pesquisa').off('click').on('click', function(){
            load();
        });

        $('#pesquisa_cliente').keypress(function(event) {
            if (event.which == 13) { // 13 é o código da tecla Enter
                load();
            }
        });
    }

    function loadFilters(){
        http('/produtos/getProdutoCategorias', function(categorias){
            categorias.Options.push({Value:0, DisplayText:'Todas Categorias'});           
            fillCombo('categorias', categorias.Options, 0); 
            load();          
        });

    }

    function load(){
        let values = getFormValues('form-produtos-pesquisa');
        $('#table-produtos').jtable('load', values);
    }

    function createGrid(){
        $('#table-produtos').jtable({
            title: 'Lista de Produtos do Sistema',
            paging: true,
            pageSize: 10,
            unAuthorizedRequestRedirectUrl: '/login',
            toolbar: {
                items: [{                  
                    text: '<span class="fa fa-list-ul" style="font-size:1.6em" title="Categorias de Produtos"></span>',
                    click: function () {
                        $('#table_categorias').jtable('load', null, function(){
                            $( "#dialog_categorias" ).dialog('open');
                        });
                        $( "#dialog_categorias" ).dialog('open');
                    }
                }]
            },
            actions: {
                listAction: '/produtos/getProdutos',
                createAction: '/produtos/criarProduto',
                updateAction: '/produtos/atualizarProduto'
            },
            fields: {
                idproduto: {
                    title: 'Id',
                    width: '23%',
                    key: true,
                    create: false,
                    edit: false,
                    list: false
                },
                tipo: {
                    title: 'Tipo',
                    width: '23%',
                    options: {0: 'Produto', 1: 'Serviço'},
                    defaultValue: 0,
                    inputClass:'form-control'
                },
                descricao: {
                    title: 'Descrição',
                    inputClass: 'validate[required,maxSize[255]] form-control'
                },
                referencia: {
                    title: 'Código do Fabricante',
                    width: '18%',
                    inputClass: 'validate[required,maxSize[255]] form-control'
                },
                nomecategoria:{type:'hidden'},
                codcategoria: {
                    title: 'Categoria',
                    width: '12%',
                    inputClass: 'form-control',
                    options:'/produtos/getProdutoCategorias',
                    
                    create:true,
                    edit:true,
                    defaultValue:1,
                    display:function(data){
                        return data.record.nomecategoria;
                    } 
                },
                valor: {
                    title: 'Valor (R$)',
                    width: '15%',
                   
                    inputClass: 'validate[required,custom[real]] form-control',
                    display:function(data){
                        return formatarMoeda(data.record.valor);
                    }
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
