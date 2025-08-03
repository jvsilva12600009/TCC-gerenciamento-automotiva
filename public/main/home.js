let Home = (function(){
    let h = {};


    function getPercentual(onload){

        fetch('../orcamento/getOrcamentoStatus', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        })
        .then(response => response.json())
        .then(response => onload(response));


    }

    function getPercentual2(onload){

        fetch('../os/getOSStatus', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        })
        .then(response => response.json())
        .then(response => onload(response));


    }

    function getOSEXECUTANTE(onload){

        fetch('../os/getExecutanteOS', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        })
        .then(response => response.json())
        .then(response => onload(response));
    }

    function getplotDonutProdutos(onload){

        fetch('../orcamento/getProdutosMaisUtilizados', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        })
        .then(response => response.json())
        .then(response => onload(response));
    }

    function getDataPeriodo(onload){

        fetch('../agenda/getAgendamentobydata', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        })
        .then(response => response.json())
        .then(response => onload(response));
    }

    function getprodutomaiscaro(onload){

        fetch('../orcamento/getProdutosMaisCaros', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        })
        .then(response => response.json())
        .then(response => onload(response));
    }

    function getpclienteagenda(onload){

        fetch('../agenda/getAgendamentosPorCliente', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        })
        .then(response => response.json())
        .then(response => onload(response));
    }

    function getpveiculoagenda(onload){

        fetch('../agenda/getAgendamentosPorVeiculo', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        })
        .then(response => response.json())
        .then(response => onload(response));
    }

    function getagendastatus(onload){

        fetch('../agenda/getagendastatus', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        })
        .then(response => response.json())
        .then(response => onload(response));
    }

    function getaosdata(onload){

        fetch('../os/getdataeOS', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        })
        .then(response => response.json())
        .then(response => onload(response));
    }

    function getaosexecutanteradar(onload){

        fetch('../os/getExecutanteOSRADAR', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        })
        .then(response => response.json())
        .then(response => onload(response));
    }

    function getorcamentodata(onload){

        fetch('../orcamento/getdataeorcamento', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        })
        .then(response => response.json())
        .then(response => onload(response));
    }

    /*PLOT GRAFICOS*/

    function plotLine32(data) {
        let labels = data.map(d => d.criacao_dia);  // Datas de criação das OS
        let serie = data.map(d => d.total_os);  // Quantidade de OS por dia
    
        var lineChart = document.getElementById("os_por_dia").getContext("2d");
        var chartId = new Chart(lineChart, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: "Ordens de Serviço por Dia",
                    data: serie,
                    borderColor: 'blue',
                    fill: false,
                    tension: 0.1  // Suaviza a linha
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Data'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Quantidade de OS'
                        }
                    }
                }
            }
        });
    }

    function plotLineorcamento(data) {
        console.log('Data received for chart:', data);  // Debugging: Check if data is being received correctly

    let labels = data.map(d => d.criacao_dia);  // Dates of creation
    let serie = data.map(d => d.total_orcamento);  // Number of OS per day

    console.log('Labels:', labels);  // Debugging: Check labels
    console.log('Series:', serie);   // Debugging: Check series

    var lineChart = document.getElementById("dia_orcamentos").getContext("2d");

    if (!lineChart) {
        console.error('Canvas element not found!');
        return;
    }

    var chartId = new Chart(lineChart, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: "Orçamentos por Dia",
                data: serie,
                borderColor: 'blue',
                fill: false,
                tension: 0.1  // Smooths the line
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Data'
                    }
                },
                y: {
                    title: {
                        display: true,
                        //text: 'Quantidade de OS'
                    }
                }
            }
        }
    });
    }
    function plotPie(data){
        let labels = data.map(d =>d.status);
        let serie = data.map(d =>d.percentage);


        var pie = document.getElementById("percentual_orcamentos").getContext("2d");
        var chartId = new Chart(pie, {
           type: 'pie',
           data: {
              labels: labels,
              datasets: [{
                 label: "Percentual de Orçamentos por Status",
                 data: serie,
                 backgroundColor: ['orange', 'green','red'],
                 hoverOffset: 5
              }],
           },
           options: {
              responsive: false,
           },
        });


    }

    function plotPieagenda(data){
        let labels = data.map(d =>d.status);
        let serie = data.map(d =>d.percentage);


        var pie = document.getElementById("percentual_a").getContext("2d");
        var chartId = new Chart(pie, {
           type: 'pie',
           data: {
              labels: labels,
              datasets: [{
                 label: "Percentual de Agenda por Status",
                 data: serie,
                 backgroundColor: [ 'red','green'],
                 hoverOffset: 5
              }],
           },
           options: {
              responsive: false,
           },
        });


    }
    
    function plotPie2(data){
        let labels = data.map(d =>d.status);
        let serie = data.map(d =>d.percentage);


        var pie = document.getElementById("percentual_os").getContext("2d");
        var chartId = new Chart(pie, {
           type: 'pie',
           data: {
              labels: labels,
              datasets: [{
                 label: "Percentual de Ordens de serviço por Status",
                 data: serie,
                 backgroundColor: ['orange', 'green','red'],
                 hoverOffset: 5
              }],
           },
           options: {
              responsive: false,
           },
        });


    }

    function plotBar(data){

        let labels = data.map(d =>d.mes);
        let serie = data.map(d =>d.total);


        var pie = document.getElementById("agendamentos_mes").getContext("2d");
        var chartId = new Chart(pie, {
           type: 'bar',
           data: {
              labels: labels,
              datasets: [{
                 label: "Agendamentos por Período",
                 data: serie,
                 backgroundColor: ['green'],
                 hoverOffset: 5
              }],
           },
           options: {
              responsive: false,
              title: {
                display: true,
                text: "Agendamentos por Período"
              }
           },
        });
    }

    function plotBarOSEXECUTANTE(data) {
        let labels = data.map(d => d.executante); // Mapeia o nome do executante
        let series = data.map(d => d.total_ordens); // Mapeia o total de ordens
    
        var bar = document.getElementById("executantes_os_mes").getContext("2d");
        var chartId = new Chart(bar, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: "Executantes que mais realizaram ordens de serviço",
                    data: series,
                    backgroundColor: 'blue', // Use um array se quiser cores diferentes
                    hoverOffset: 5
                }],
            },
            options: {
                responsive: false,
                title: {
                    display: true,
                    text: "Executantes que mais realizaram ordens de serviço"
                }
            },
        });
    }

    function plotDonutProdutos(data) {
        let labels = data.map(d => d.nome_produto); // Mapeia o nome do produto
        let series = data.map(d => d.total_utilizado); // Mapeia o total utilizado
    
        var donut = document.getElementById("produtos_mais_usados").getContext("2d");
        var chartId = new Chart(donut, {
            type: 'doughnut', // Tipo de gráfico donut
            data: {
                labels: labels,
                datasets: [{
                    label: "Produtos mais utilizados em manutenções",
                    data: series,
                    backgroundColor: [
                        'red', 'orange', 'yellow', 'green', 'blue', 'purple',
    'cyan', 'magenta', 'lime', 'pink', 'brown', 'grey',
    'black', 'white', 'navy', 'teal', 'violet', 'indigo',
    'gold', 'silver', 'coral', 'salmon', 'crimson', 'khaki',
    'peach', 'lavender', 'maroon', 'olive', 'plum', 'chocolate',
    'turquoise', 'tan', 'periwinkle', 'chartreuse', 'auburn', 'burgundy',
    'seafoam', 'mint', 'apricot', 'mustard', 'amber', 'azure',
    'ruby', 'sapphire', 'emerald', 'topaz', 'jade', 'onyx',
    'steelblue', 'lightpink', 'lightgreen', 'lightyellow', 'lavenderblush', 'pearl' // Adicione mais cores se necessário
                    ],
                    hoverOffset: 5
                }],
            },
            options: {
                responsive: false,
                title: {
                    display: true,
                    text: "Produtos mais utilizados em manutenções"
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(tooltipItem) {
                                const productName = tooltipItem.label;
                                const quantity = tooltipItem.raw; // Total utilizado
                                return `${productName}: ${quantity}`; // Mostra o nome do produto e a quantidade
                            }
                        }
                    }
                }
            },
        });
    }
    
    function plotLineChartProdutosCaros(data) {
        let labels = data.map(d => d.descricao); // Mapeia a descrição do produto
        let values = data.map(d => d.valor); // Mapeia o valor do produto
    
        var lineChartCtx = document.getElementById("caros").getContext("2d");
        var lineChart = new Chart(lineChartCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: "Produtos Mais Caros",
                    data: values,
                    borderColor: 'black', // Cor da linha
                    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Cor do fundo da área
                    fill: true, // Preenche a área abaixo da linha
                    tension: 0.1 // Curvatura da linha
                }],
            },
            options: {
                responsive: true,
                title: {
                    display: true,
                    text: "Produtos Mais Caros"
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            },
        });
    }

    function plotAgendamentosPorCliente(data) {
        let labels = data.map(d => d.cliente); // Extrai os nomes dos clientes
        let series = data.map(d => d.total_agendamentos); // Extrai o total de agendamentos por cliente
    
        var ctx = document.getElementById("agendamentos_cliente").getContext("2d");
        var chartId = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: "Agendamentos por Cliente",
                    data: series,
                    backgroundColor: 'rgba(0, 123, 255)',
                    borderColor: 'rgba(0, 123, 255, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                title: {
                    display: true,
                    text: 'Agendamentos por Cliente'
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: ''
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Total de Agendamentos ativos'
                        },
                        beginAtZero: true
                    }
                }
            }
        });
    }
   
    function plotAgendamentosPorVeiculo(data) {
        try {
            // Chama a função que obtém os dados
            

            // Se os dados existirem, renderiza o gráfico
            if (data && data.length > 0) {
                let labels = data.map(d => d.veiculo); // Extrai os nomes dos veículos
                let series = data.map(d => d.total_agendamentos); // Extrai o total de agendamentos por veículo
            
                var ctx = document.getElementById("agendamentos_veiculo").getContext("2d");
                var chartId = new Chart(ctx, {
                    type: 'bar', // Modifiquei para "bar" em vez de "horizontalBar" pois "horizontalBar" foi depreciado no Chart.js 3.x
                    data: {
                        labels: labels,
                        datasets: [{
                            label: "Agendamentos por Veículo",
                            data: series,
                            backgroundColor: 'rgba(255, 99, 132)',
                           
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            title: {
                                display: true,
                               // text: 'Agendamentos por Veículo'
                            }
                        },
                        scales: {
                            x: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Total de Agendamentos'
                                }
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: 'Veículo'
                                }
                            }
                        }
                    }
                });
            } else {
                console.error('Nenhum dado encontrado para agendamentos por veículo.');
            }
        } catch (error) {
            console.error('Erro ao renderizar o gráfico: ', error);
        }
    }
    

    function plotRadar(data) {
        let labels = data.map(d => d.executante);  // Nomes dos executantes
    let serie = data.map(d => d.total_os);  // Quantidade de OS por executante

    var radarChart = document.getElementById("os_por_executante").getContext("2d");
    var chartId = new Chart(radarChart, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [{
                label: "Ordens de Serviço por Executante",
                data: serie,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                pointBackgroundColor: 'rgba(54, 162, 235, 1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,  // Ensure it matches the container size
            scales: {
                r: {
                    beginAtZero: true
                }
            }
        }
    });
    }


    h.start = function(){
        getOSEXECUTANTE(plotBarOSEXECUTANTE);
        getPercentual2(plotPie2);
        getPercentual(plotPie);
        getDataPeriodo(plotBar);
        getplotDonutProdutos(plotDonutProdutos);
        getprodutomaiscaro(plotLineChartProdutosCaros);
        getpclienteagenda(plotAgendamentosPorCliente);
        getpveiculoagenda(plotAgendamentosPorVeiculo);
        getagendastatus(plotPieagenda);
        getaosdata(plotLine32);
        getaosexecutanteradar(plotRadar);
        getorcamentodata(plotLineorcamento);
    }




    //


    return h;
})();
   
   
Home.start();
   