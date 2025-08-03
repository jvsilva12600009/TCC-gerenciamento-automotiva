

var Agenda = (function(){
    let agenda = {};

    agenda.start = function(){
        createGrid();
        addListeners();
    }
    $('#btn-orcamento-exportar').click(function () {
        let $selectedRows = $('#table-orcamento').jtable('selectedRows');
        if ($selectedRows.length > 0) {
            let selectedRow = $selectedRows.data('record');
            window.location.href = `/orcamento/exportarOrcamentoParaPDF/${selectedRow.idorcamento}`;
        } else {
            alert('Selecione um orçamento para exportar');
        }
    });
    function addListeners(){
        $('#btn-orcamento-pesquisa').off('click').on('click', function(){           
            load();
        }).click();

        $('#pesquisa_agenda').keypress(function(event) {
            if (event.which == 13) { // 13 é o código da tecla Enter
                load();
            }
        });
    }

    function load(){
        let filters = getFormValues('form-pesquisa-orcamento');      
        $('#table-orcamento').jtable('load', filters);
    }
    
    function exportarOrcamentoParaPDF() {
        let selectedRows = $('#table-orcamento').jtable('selectedRows');
        if (selectedRows.length > 0) {
            let orcamentoId = selectedRows.data('record').idorcamento;
            window.location.href = `/orcamento/exportarOrcamentoParaPDF/${orcamentoId}`;
        } else {
            alert('Por favor, selecione um orçamento para exportar.');
        }
    }
    
    function createGrid(){
        $('#table-orcamento').jtable({
            title: 'Lista de orçamentos do Sistema',
            paging: true, 
            selecting: true,
            pageSize: 10,   
            unAuthorizedRequestRedirectUrl:'/login', 
            openChildAsAccordion :true,   
            actions: {
                listAction: '/orcamento/getOrcamento',
                createAction: '/orcamento/criarOrcamento',
                updateAction: '/orcamento/atualizarOrcamento'
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
                hasos:{type:'hidden', create:false, edit:true},
                agenda:{type:'hidden', create:false, edit:false},
                produtos: {                
                    title: 'Produtos',
                    list: true,
                    create: false,
                    edit: false,
                    display: function (data){
                        return showprodutos(data.record.idorcamento,data.record.status);
                    }
                },                
                codagenda: {
                    title: 'Código da agenda',
                    width: '23%',
                    options: '../agenda/getAgendamentos',  
                    inputClass: 'form-control',
                    defaultValue: 0,
                    display:function(data){
                        return data.record.agenda;
                    }
                },
                codusuario: {
                    title: 'Código do usuário',
                    width: '13%',
                    create: false,
                    edit: false,
                    list: false
                },  
                datacriacao:{
                    title: 'Data de Criação do Orçamento',
                    width: '15%',
                     
                    create: false,
                    edit: false,
                    
                },
                datavalidade:{
                    title: 'Data de Validade do Orçamento',
                    width: '15%',
                    inputClass: 'validate[required,custom[date]] form-control',
                    type:'date' , 
                    displayFormat: 'dd/mm/yy',                    
                    display: function (data) {
                        return data.record.datavalidade ;
                    },
                },
                dataprevisao:{
                    title: 'Data Prevista',                   
                    inputClass: 'validate[required,custom[date]] form-control dataos',
                    type:'date' , 
                    displayFormat: 'dd/mm/yy',                    
                    create: false,                    
                    edit: true,
                    list: false,
                    display: function (data) {
                        return data.record.dataprevisao ;
                    },
                },
                datainicio:{
                    title: 'Data Inicio',                  
                    inputClass: 'validate[required,custom[date]] form-control dataos',
                    type:'date' , 
                    displayFormat: 'dd/mm/yy',                    
                    create: false,                    
                    edit: true,
                    list: false,
                    display: function (data) {
                        return data.record.datainicio ;
                    },
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
                        return data.record.total == 0 ?  '<div class="total"></div>' : `<div class="total">${formatarMoeda(data.record.total)}</div>`;
                    }

                }
            },
            formCreated: function(event, data){   
                setDatePicker(data, 'datavalidade');   
                data.form.find('input[name=datavalidade]').attr('readonly', true); // Impede a digitação manual
                addFormListeners(data);
                setDatePicker(data, 'dataprevisao');
                setDatePicker(data, 'datainicio');

            },
            recordUpdated:function(event, data){
                if(data.serverResponse.Result == 'OK'){
                    
                    load();
                }
            },
            rowInserted: function (event, data){
				if(data.record.status == 0){					
					data.row.find('.jtable-edit-command-button').show();		
				}else{
					data.row.find('.jtable-edit-command-button').hide();					
				}
			},
        });       
    }


    function setDatePicker2(data, campo){ 
        let validade = $(`input[name=${campo}]`);
        console.log(validade, data)
        validade.attr('readonly', true);  // Impede a digitação manual
    
        if (data.formType == 'edit' && data.record[campo]) {
            let d = new Date(data.record[campo].split('/').reverse().join('/'));                    
            validade.datepicker('option', 'minDate', d);
            validade.datepicker('setDate', d);
        } else {
            validade.datepicker('option', 'minDate', 0);
        }
    }

    function addFormListeners(data){
      
        data.form.find('select[name=status]').off('change').on('change', function(){
            
            if($(this).val() == 1){
                data.form.find('.dataos').closest('.jtable-input-field-container').show();
               
            }else{
                data.form.find('.dataos').closest('.jtable-input-field-container').hide();
            }
        }).change();

    }

/*
function addFormListeners(event, data) {
    // Obtendo a data de criação do orçamento
    //let dataCriacao = data.form.find('input[name=datacriacao]').val();

    // Função que exibe ou oculta os campos 'previsao' e 'inicio'
    function toggleDateFieldsBasedOnStatus() {
        let status = data.form.find('select[name=status]').val();
        
        // Verifica se o status é 'Aprovado' (1)
        if (status == 1) {
            // Exibe os campos de previsão e início
            data.form.find('.dataos').closest('.jtable-input-field-container').show();

            // Configura o datepicker para os campos previsao e inicio com a validação de data mínima
            setDatePicker(data, 'previsao');
            setDatePicker(data, 'inicio');
        } else {
            // Oculta os campos de previsão e início
            data.form.find('.dataos').closest('.jtable-input-field-container').hide();
        }
    }

    // Ao carregar o formulário, esconde ou mostra os campos com base no status atual
    toggleDateFieldsBasedOnStatus();

    // Ao alterar o status, ajusta a exibição dos campos
    data.form.find('select[name=status]').off('change').on('change', function() {
        toggleDateFieldsBasedOnStatus();
    });
}
*/

    function getActionsProdutosOrcamento(id, status){

        var actions = {
            listAction: `/orcamento/getProdutos?orcamento=${id}`
        };
        if(status == 0){
            actions['createAction'] = '/orcamento/adicionarProduto';
            actions['updateAction'] = '/orcamento/atualizarProduto';
            actions['deleteAction'] = '/orcamento/deleteProduto';
        }
        return actions

    }

    function showprodutos(id, status){
        var $img = $('<span class="fa fa-shopping-basket" style="font-size:1.6em; cursor:pointer" title="Cadastro de Produtos" />');
        var ref = null;

        $img.click(function () {
            
            $('#table-orcamento').jtable('openChildTable',
                $img.closest('tr'), {
                    title: 'Lista de Produtos do orçamento',
                    paging: true, 
                    pageSize: 10,   
                    ajaxSettings: {
                        'dataFilter': function(data, tipo) {
                            let valores = JSON.parse(data);
                            if (valores.interceptor == 'produtos') {
                                produtos = valores.Options;
                            }
                            return data;
                        },
                    },
                    actions: getActionsProdutosOrcamento(id, status),
                    fields: {
                        id: {
                            title: 'Id',
                            width: '23%',
                            key: true,
                            create: false,
                            edit: false,
                            list: false
                        },
                        
                        codorcamento: {
                            type: 'hidden',
                            defaultValue: id           
                        },
                        valorInicial: {
                            type: 'hidden',
                            defaultValue: 0           
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
                        valor: {
                            title: 'Valor',
                            width: '8%' ,
                            create: false,
                            edit: false,
                            list: true,
                            inputClass: 'validate[required,custom[real]] form-control',
                            display: function(data){
                                return formatarMoeda(data.record.valor);
                            }          
                        },
                        quantidade: {
                            title: 'Quantidade',
                            width: '15%',
                            inputClass: 'validate[required,custom[integer]] form-control'           
                        }
                    },
                    formCreated: function(event, data){
                        addProdutoListener(data);
                    },
                    formSubmitting: function (event, data) {              
                        return data.form.validationEngine('validate');
                    },           
                    formClosed: function (event, data) {
                        data.form.validationEngine('hide');
                        data.form.validationEngine('detach');
                    },
                    recordUpdated:function(event, data){
                        if(data.serverResponse.Result == 'OK' && ref){
                            ref.jtable('reload');
                        }
                    },
                    recordsLoaded:function(event, data){
                        if(data.serverResponse.Result == 'OK' ){                            
                            atualizarValorTotal(data, id);
                        }
                    }
                }, function (data) {
                    data.childTable.jtable('load');
                    ref = data.childTable;
                });
        });
        
        return $img;
    }

    function atualizarValorTotal(data, id){        
        var parentRow = $('#table-orcamento').jtable('getRowByKey',id)
        if(parentRow && parentRow[0]){     
            var total = 0;
            data.records.forEach(r =>{
                total += ( r.quantidade * r.valor);
            });            
            $(parentRow[0]).find('.total').html(`<div class="total">${formatarMoeda(total)}</div>`);
        }  
    }

    function addProdutoListener(data){
        data.form.find('select[name=codproduto]').off('change').on('change', function(){
            let id = $(this).val();
            let produto = produtos.find(p => p.Value == id);
            data.form.find('input[name=valorInicial]').val(produto.valor);
        }).change();
    }

    return agenda;
})();

Agenda.start();

