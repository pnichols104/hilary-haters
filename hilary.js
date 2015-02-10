var tooltips = [];
var approval = [];
var event_series = [];

var sectionLabelFontSize = '16px';

var plotLinesColor = 'white';
var plotBandLabelVertOffset = -330;
var firstPlotLinePosition = new Date(1993, 1, 20).getTime();
var secondPlotLinePosition = new Date(2001, 1, 3).getTime();
var thirdPlotLinePosition = new Date(2009, 1, 21).getTime();
var fourthPlotLinePosition = new Date(2013, 0, 0).getTime();

$.when(
    $.ajax({
        url: "data.json",
        success: function(data) {
            for (i = 0; i < data.length; i++){
                approval.push([new Date(data[i].poll_epoch*1000).getTime(), data[i].fav]);
            }
        },
    })
    ).then(function(){
        $.when(
            $.ajax({
                url: "events.json",
                success: function(data) {
                    for (var i = 0; i < data.length; i++){
                        var date = new Date(data[i].date).getTime();
                        var y_value = Math.round(getYValue(approval, date));
                        var new_event = {};
                        new_event['date'] = data[i].date;
                        new_event['y_value'] = y_value;
                        new_event['incident'] = data[i].incident;
                        tooltips.push(new_event);
                        event_series.push([date, y_value, data[i].incident]);
                    }
                }
            })
        ).then(function(){
            build_graph();
            });
    });

function getYValue(dataset, date){
    //gets rating estimate for closest surrounding dates using algebraic fun-times
    var point_1, point_2;
    for (var j = 0; j < dataset.length; j++){
        if (dataset[j][0] > date) {
            point_1 = dataset[j-1];
            point_2 = dataset[j];
            break;
        }
    }
    var slope = (point_2[1] - point_1[1]) / (point_2[0] - point_1[0]);
    var rating = slope * (date - point_2[0]) + point_2[1];
    return rating;
}

function build_graph(){
    $('#container').highcharts({
        chart: {
            type: 'area',
            style: {
                fontFamily: '"Lato", Helvetica, Arial, sans-serif'
            }
        },
        title: {
            text: ''
        },
        colors: ['#FB0042'],
        legend: {
            enabled: false
        },

        xAxis: {
            type: 'datetime',
            tickInterval: 365 * 24 * 60 * 60 * 1000,
            // gridZIndex: 7,
            // gridLineColor: '#666',
            // gridLineDashStyle: 'Dash',
            // gridLineWidth: 2,
            plotLines: [{
                color: plotLinesColor,
                value: firstPlotLinePosition, //Bill sworn in
                width: 2,
                zIndex: 6,
            },
            {
                color: plotLinesColor,
                value: secondPlotLinePosition, //Becomes U.S Senator
                width: 2,
                zIndex: 6,
            },
            {
                color: plotLinesColor,
                value: thirdPlotLinePosition, //Secretary of State
                width: 2,
                zIndex: 6,
            },
            {
                color: plotLinesColor,
                value: fourthPlotLinePosition, //Secretary of State
                width: 2,
                zIndex: 6,
            }]
        },
        yAxis: {
            title: {
                text: 'Approval rating'
            },
            min: 31,
            max: 70,
            gridZIndex: 7,
            gridLineColor: '#666',
            gridLineDashStyle: 'Dash',
            tickInterval: 10,
            startOnTick: false,
            labels: {
                formatter: function () {
                    return this.value + '%';
                }
            }
        },
        tooltip: {
            enabled: true,
            useHTML: true,
            zIndex: 60,
            style: {
                fontFamily: "Lato"
            },
            backgroundColor: '#FFFFFF',
            borderColor: '#CCCCCC',
            borderRadius: 10,
            borderWidth: 1,
            formatter: function() {
                return "<div class='percentage'>" + this.point.y + "%</div>" + "<div class='date'>" + tooltips[this.point.index].date + "</div>" + "<div class='incident'>" + tooltips[this.point.index].incident + "</div>";
            },
        },
        credits: {
            enabled: false
        },
        plotOptions: {
            area: {
                fillOpacity: 1,
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: false
                        }
                    }
                }
            },
            scatter: {
                useHTML: true,
                color: "black",
                cursor: "pointer",
                marker: {
                    enabled: true,
                    symbol: "circle",
                    radius: 4,
                },
                states: {
                    hover: {
                        enabled: false
                    }
                }
            }
        },
        series: [
            {
                name: 'Approval Ratings',
                data: approval,
                type: 'area',
                enableMouseTracking: false,
            },
            {
                name: 'Events',
                data: event_series,
                type: 'scatter',
                tooltip: true,
                enableMouseTracking: true,
            },
            {   name: 'Labels',
                data: [[(firstPlotLinePosition + secondPlotLinePosition) / 2, 0], [(secondPlotLinePosition + thirdPlotLinePosition) / 2, 0], [(thirdPlotLinePosition + fourthPlotLinePosition) / 2, 0]],
                type: 'scatter',
                tooltip: false,
                enableMouseTracking: false

            }
        ]
    }, function(chart){

        var labelOnePos = chart.series[2].data[0],
            text1 = chart.renderer.text(
                'First Lady<br>1993-2001',
                labelOnePos.plotX + chart.plotLeft,
                labelOnePos.plotY + chart.plotTop + plotBandLabelVertOffset
            ).attr({
                zIndex: 7,
                align: 'center'
            }).css({
                fontSize: sectionLabelFontSize,
                color: 'white',
            }).add(),
            box1 = text1.getBBox();

        var labelTwoPos = chart.series[2].data[1],
            text2 = chart.renderer.text(
                'U.S. Senator<br>2001-2009',
                labelTwoPos.plotX + chart.plotLeft,
                labelTwoPos.plotY + chart.plotTop + plotBandLabelVertOffset
            ).attr({
                zIndex: 7,
                align: 'center'
            }).css({
                fontSize: sectionLabelFontSize,
                color: 'white'
            }).add(),
            box2 = text2.getBBox();

        var labelThreePos = chart.series[2].data[2],
            text3 = chart.renderer.text(
                'Secretary of State<br>2009-2013',
                labelThreePos.plotX + chart.plotLeft,
                labelThreePos.plotY + chart.plotTop + plotBandLabelVertOffset
            ).attr({
                zIndex: 7,
                align: 'center'
            }).css({
                fontSize: sectionLabelFontSize,
                color: 'white'
            }).add(),
            box3 = text3.getBBox();
    });
}

$(document).ready(function(){
    $(window).resize(function(){
        build_graph();
    });
});

// $( window ).resize(function() {
//     var graph = $('#container').highcharts();

//     if ($(window).width() < 500) {
//         console.log(graph);
//         console.log('small window');
//         // graph.options.plotOptions.scatter.marker.radius = 8;
//         // graph.series[1].update();
//     }
//     else {
//         console.log(graph);
//         console.log('big window');

//         // graph.options.plotOptions.scatter.marker.radius = 4;
//         // graph.series[1].update();
//     }
// });