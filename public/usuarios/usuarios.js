var Usuarios = (function(){
    let agenda = {};

    function createGrid() {
        $('#table-usuarios').jtable({
            title: 'Lista de Usuários do Sistema',
            paging: true,
            pageSize: 10,
            unAuthorizedRequestRedirectUrl: '/login',
            openChildAsAccordion: true,
            actions: {
                listAction: '/usuarios/getUsuarios',
                createAction: '/usuarios/createUsuario',
                updateAction: '/usuarios/updateUsuario'
            },
            fields: {
                veiculos: {
                    title: '',
                    width: '3%',
                    create: false,
                    edit: false,
                    display: function(data) {
                        return showVeiculos(data.record.idusuarios);
                    }
                },
                idusuarios: {
                    title: 'Id',
                    width: '23%',
                    key: true,
                    create: false,
                    edit: false,
                    list: false
                },
                nome: {
                    title: 'Nome',
                    inputClass: 'validate[required,maxSize[255]] form-control',
                    width: '23%'
                },
                email: {
                    title: 'Email',
                    inputClass: 'validate[required,maxSize[255],custom[email]] form-control',
                },
                senha: {
                    title: 'Senha',
                    width: '23%',
                    inputClass: 'validate[required,maxSize[255]] form-control',
                    list: false,
                    edit: false
                },
                endereco: {
                    title: 'Endereço',
                    inputClass: 'validate[required,maxSize[255]] form-control',
                    width: '13%'
                },
                cpf: {
                    title: 'CPF',
                    
                    width: '12%',
                    inputClass: 'validate[required,custom[cpf], custom[number]] form-control'
                },
                telefone: {
                    title: 'Telefone',
                    inputClass: 'validate[required,custom[phone]] form-control',
                    width: '5%'
                },
                tipousuario: {
                    title: 'Tipo do Usuário',
                    width: '30%',
                    inputClass: 'form-control',
                    options: {0: 'Cliente', 1: 'Técnico', 2: 'Gerente'},
                    defaultValue: 0
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

    function showVeiculos(id){
        var $img = $('<img src="../imgs/carro-icone.png" title="Veiculos Cadastrados para o Usuário" />');
        $img.click(function () {
            $('#table-usuarios').jtable('openChildTable',
                $img.closest('tr'), //Parent row
                {
                    title: 'Lista de Veiculos do Cliente',
                    actions: {
                        listAction: `../veiculos/getVeiculos?id=${id}`,
                        createAction: '../veiculos/criarVeiculos',
                        updateAction: '../veiculos/atualizarVeiculos'
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
                        codcliente: {
                            type: 'hidden',
                            defaultValue: id
                        },
                        modelo: {
                            inputClass: 'validate[required,maxSize[255]] form-control',
                            title: 'Modelo'
                        },
                        placa: {
                            inputClass: 'validate[required,maxSize[6]] form-control',
                            title: 'Placa',
                            width: '13%'
                        },
                        cor: {
                            inputClass: 'validate[required,maxSize[255]] form-control',
                            title: 'Cor',
                            width: '12%'
                        },
                        ano: {
                            inputClass: 'validate[required,custom[number],minSize[4],maxSize[4]] form-control',
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
                    formSubmitting: function (event, data) {              
                        return data.form.validationEngine('validate');
                    },           
                    formClosed: function (event, data) {
                        data.form.validationEngine('hide');
                        data.form.validationEngine('detach');
                    }
                },
                function (data) { //opened handler
                    data.childTable.jtable('load');
                });
        });

        return $img;
    }

    agenda.start = function(){
        createGrid();
        addListeners();
    }

    function addListeners(){
        $('#btn-pesquisa').off('click').on('click', function(){
            load();
        }).click();

        $('#pesquisa_cliente').keypress(function(event) {
            if (event.which == 13) { // 13 é o código da tecla Enter
                load();
            }
        });
    }

    function load(){       
        let filters = getFormValues('form-pesquisa-usuarios');
        $('#table-usuarios').jtable('load', filters);
    }

    return agenda;
})();

Usuarios.start();