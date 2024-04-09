var currentDate = new Date();

// Date
var startdate = currentDate.toISOString().split('T')[0];
var enddate = currentDate.toISOString().split('T')[0];

// Time
var starttime = currentDate.toLocaleTimeString().slice(0, -3);
currentDate.setHours(currentDate.getHours() + 3);
var endtime = currentDate.toLocaleTimeString().slice(0, -3);

var filterToken = [];
var url = "https://url/index.php/lizmap/service/?repository=your-rrepo&project=your-project";

lizMap.events.on({
    'uicreated': function(_) {
        var map = lizMap.map;
        $('#layers-fold-all').click();

        var layer = map.getLayersByName("name of your layer")[0]; 
        // You can put here as much layers as you need 

        addFilter(layer);

        $("#time-slider").timeslider({
            sliderOptions: {
                range: true, 
                min: 0, 
                max: 1439, 
                step:5
            },
            clockFormat: 24, 
            startTime: starttime, 
            endTime: endtime,
            errorMessage: '#max-time',
            timeDisplay: '#time',
        });
        
    }
});

/*
Add a filter to the lizmap app
*/

addFilter = (layer) => {
    var html = '<div id="filter_content"></div>';
    lizMap.addDock(
        'filter_date',
        'Filtre par date',
        'minidock',
        html,
        'icon-time'
    );

    $(".filter_date.nav-minidock").insertAfter(".filter.nav-dock");

    $("#filter_content").append(addForm());

    applyFilter(layer, startdate + 'T' + starttime, enddate + 'T' + endtime);

    $('#button-filter_date').click();
    
    // On click, change the values of the start and end date/time
    $('#change_date').on('click', function() {
        var startdate = $('#datestart_id').val();
        var enddate = $('#dateend_id').val();
        var starttime = $(this).text().split(' - ')[0];
        var endtime = $(this).text().split(' - ')[1];
        applyFilter(layer, startdate + 'T' + starttime, enddate + 'T' + endtime);
    });
}

/*
Create a form that will send date and time data
*/ 

function addForm() {
    var form = $('<form>').attr({
        id: 'dateTimeFilterForm',
        method: 'GET',
        action: ''
    });

    var dateSliderDiv = $('<div>').addClass('slider').append(
        $('<label>').attr('for', 'datestart_id').text('Départ:'), 
        $('<input>').attr({
            id: 'datestart_id',
            type: 'date',
            name: 'datestart',
            value: startdate
        }).on('change', function(){
            startdate = $(this).val();
        }),
        $('<br>'), 
        $('<label>').attr('for', 'dateend_id').text('Fin:'), 
        $('<input>').attr({
            id: 'dateend_id',
            type: 'date',
            name: 'dateend',
            value: enddate
        }).on('change', function(){
            enddate = $(this).val();
        })
    );
    
    var timeSliderDiv = $('<div class="time-slider">').append(
        $('<div>').attr('id', 'max-time'),
        $('<div>').attr('id', 'time').on('change', function(){
            starttime = $(this).text().split(' - ')[0];
            endtime = $(this).text().split(' - ')[1];
        }),
        $('<div>').attr('id', 'time-slider')
    );

    var centerDiv = $('<div>').css({
        display: 'flex',
        justifyContent: 'center'
    });

    var submitButton = $('<input>').attr({
        type: 'button',
        value: 'Afficher',
        id: 'change_date'
    });

    form.append(dateSliderDiv, $('<br>'), timeSliderDiv, $('<br>'),centerDiv.append(submitButton));
    return form;
}

/* 
Apply the filter to the layer you want
*/
applyFilter = (layer) => {
    filterToken = [];
    filterLayer(layer, date_start, date_end);
    // If you want to apply the date and time filter on multiple layer, you can
    // call more than once the filterLayer() function.
}

filterLayer = (layer, date_start, date_end) => {
    layerName = layer.params.LAYERS;
    var xhr = new XMLHttpRequest();

    // Change the filter and the name of your date columns according to your data
    var yourFilter = layerName +': ( "debut" IS NULL OR "debut" <= \'' + date_start + '\' AND "fin" IS NULL OR "fin" >= \'' + date_end + '\' )';

    var params = {
        service: "WMS",
        request: "GETFILTERTOKEN",
        typename: layerName,
        filter: yourFilter
    };

    // Request to the server
    var encodedParams = Object.keys(params).map(function(key) {
        return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
    }).join('&');

    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.setRequestHeader("Accept", "*/*");
    xhr.setRequestHeader("Accept-Language", "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7");
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            filterToken.push(JSON.parse(xhr.responseText).token);
            layer.mergeNewParams({'FILTERTOKEN':JSON.parse(xhr.responseText).token});
            layer.redraw();
        }else{
            console.error("Server errorr :", xhr.status, xhr.statusText);
            console.log("error");
        }
    };
    
    xhr.send(encodedParams);
}