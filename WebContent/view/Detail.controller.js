jQuery.sap.require('DHBW.formatter.formatter');
$.sap.require('sap.ui.thirdparty.jqueryui.jquery-ui-core');
$.sap.require('sap.ui.thirdparty.jqueryui.jquery-ui-widget');
$.sap.require('sap.ui.thirdparty.jqueryui.jquery-ui-mouse');
$.sap.require('sap.ui.thirdparty.jqueryui.jquery-ui-resizable');
$.sap.require('sap.ui.thirdparty.jqueryui.jquery-ui-draggable');
$.sap.require('sap.ui.thirdparty.jqueryui.jquery-ui-droppable');

$.sap.require('DHBW.script.jquery-touch-punch');
$.sap.require('DHBW.script.moment');
$.sap.require('DHBW.script.FileSaver');
$.sap.require('DHBW.script.Blob');
$.sap.require('DHBW.script.ics');
$.sap.require('DHBW.script.fullcalendar');
$.sap.require('DHBW.script.html2canvas');

function getFormattedDateObject (start, end, table_item_4_text) {
    var zeit = "PT"+("00"+start.getHours()).slice(-2)+"H"+("00"+start.getMinutes()).slice(-2)+"M"+("00"+start.getSeconds()).slice(-2)+"S";
    var start_of_start_day = new Date(start.getTime());
    start_of_start_day.setHours(0,0,0,0);
    var tag = start_of_start_day.toISOString().substring(0, start_of_start_day.toISOString().length-5);


    var zeit2 = "PT"+("00"+end.getHours()).slice(-2)+"H"+("00"+end.getMinutes()).slice(-2)+"M"+("00"+end.getSeconds()).slice(-2)+"S";
    var start_of_end_day = new Date(end.getTime());
    start_of_end_day.setHours(0,0,0,0);
    var tag2 = start_of_end_day.toISOString().substring(0, start_of_end_day.toISOString().length-5);

    var t_item_4 = new Date(table_item_4_text);
    t_item_4.setHours(0,0,0,0);
    var tag3 = t_item_4.toISOString().substring(0, t_item_4.toISOString().length-5);

    return {
        Termin: tag3,
        Sdate: tag,
        Suzeit: zeit,
        Edate: tag2,
        Euzeit: zeit2
    }
}

function getSAPToken (o) {
    var o = (o||{});
    var successful = (o.successful||function(token){});
    var failure = (o.failure||function(data){});

    $.ajax({
        type: 'GET',
        url: "/sap/opu/odata/SAP/Z_WP_SRV",
        headers: {
            "X-Requested-With": "XMLHttpRequest",
            "Content-Type": "application/atom+xml",
            "DataServiceVersion": "2.0",
            "X-CSRF-Token":"Fetch"
        }
    }).fail(function(data){ failure(data); }).done(function(data, status, headers) { var token = headers.getResponseHeader('X-CSRF-Token'); successful(token); });
}

function putAuftragsSet (o) {
    // Callbacks definieren
    var o = (o||{});
    var successful = (o.successful||function(token){});
    var failure = (o.failure||function(data){});

    // Überprüfen, ob die notwendigen Variablen deklariert sind
    if (typeof o.data == 'undefined' || typeof  o.token == 'undefined') {
        failure();
        return;
    }

    var token = o.token;
    var data = o.data;

    var record = '<atom:entry xmlns:atom="http://www.w3.org/2005/Atom">'+
        '<atom:id>tag:com.sap,2010-06-24:/subscriptions/123</atom:id>'+
        '<atom:title>Create new user</atom:title><atom:author/>'+
        '<atom:updated/>'+
        '<atom:content type="application/xml">'+
        '<m:properties xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices">'+
        '<d:Aufnr m:type="Edm.String">' + data.Aufnr + '</d:Aufnr>'+
        '<d:Pernr m:type="Edm.String">' + data.Pernr + '</d:Pernr>'+
        '<d:Sdate m:type="Edm.DateTime">' + data.Sdate + '</d:Sdate>'+
        '<d:Edate m:type="Edm.DateTime">' + data.Edate + '</d:Edate>'+
        '<d:Euzeit m:type="Edm.Time">' + data.Euzeit + '</d:Euzeit>'+
        '<d:Suzeit m:type="Edm.Time">' + data.Suzeit + '</d:Suzeit>'+
        '</m:properties>'+
        '</atom:content>'+
        '</atom:entry>';

    $.ajax({
        type: 'PUT',
        url: "/sap/opu/odata/SAP/Z_WP_SRV/AuftragSet('"+data.Aufnr+"')",
        headers: {
            "X-CSRF-Token": token,
            "Content-Type": "application/atom+xml"
        },
        data: record
    }).done(function(d){
        successful(d);
    }).fail(function(d){
        failure(d);
    });
}

sap.ui.controller("DHBW.view.Detail", {


    onInit: function () {

        this.id = "";
        var that = this;
        sap.ui.core.UIComponent.getRouterFor(this).attachRouteMatched(function (oEvent) {
            if (oEvent.getParameter("name") == "Detail") {
                try {
                    var hohe = $(window).height();
                    hohe = hohe * 0.58;
                    this.getView().byId("idTable").setVisible(true);
                    $('#calendar').fullCalendar('option', 'height', hohe);

                } catch (e) {
                }
                //Binding aktualisieren wenn nötig
                var tab = this.getView().byId("idTable");
                var bind = tab.getBinding("items");
                if (typeof(bind) != "undefined") {
                    bind.filter([new sap.ui.model.Filter("Perno",
                        sap.ui.model.FilterOperator.EQ, oEvent.getParameters().arguments.contextPath)]);

                }

                window.id = oEvent.getParameters().arguments.contextPath;
                window.view = this.getView();

                $('#calendar').fullCalendar('removeEvents');
                this.name = "";
                that = this;

            }

        }, this);

        var table = this.getView().byId("idTable");
        table.attachUpdateFinished(function () {




            //Sind im context der Tabelle
            var items = this.getItems();
            var da = false;
            for (var index = 0; index < items.length; index++) {


                var element = items[index];
                (function (element) {
                    element.addEventDelegate({
                        onmousedown: function () {
                            mouseState = setTimeout(
                                function () {
                                    $("#" + element.sId).draggable({
                                        appendTo: 'body',
                                        helper: 'clone',
                                        cursor: 'move',
                                        revert: 'invalid',
                                        start: function (event, ui) {
                                            ui.helper.width($("#" + element.sId).width());
                                            $("#box_assign").css("visibility", "visible");
                                            $("#box_delete").css("visibility", "visible");
                                        },
                                        stop: function () {
                                            element.removeStyleClass("sapMLIBSelected");
                                            $("#box_assign").css("visibility", "hidden");
                                            $("#box_delete").css("visibility", "hidden");
                                        }
                                    });
                                    element.addStyleClass("sapMLIBSelected");
                                }, 600
                            );
                        }
                    });
                })(element);
            }

        });
    },


    onAfterRendering: function () {
        //Kalender
        jQuery.sap.require('DHBW.script.demo');
        var year = new Date().getFullYear();
        var month = new Date().getMonth();
        var day = new Date().getDate();
        var hohe = $(window).height();
        hohe = hohe * 0.58;

        $('#calendar').fullCalendar({
                header: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'month,agendaWeek,agendaDay'
                },
                selectable: true,
                editable: true,
                titleFormat: "D. MMM YYYY",
                axisFormat: 'H(:mm)',
                columnFormat: 'ddd DD.MM',
                timeFormat: 'H(:mm)',
                allDaySlot: false,
                firstDay: 1,
                dayNamesShort: ['Son', 'Mon', 'Die', 'Mit', 'Don', 'Fre', 'Sam'],
                defaultView: "agendaWeek",
                monthNames: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli',
                    'August', 'September', 'Oktober', 'November', 'Dezember'],
                height: hohe,
                buttonText: {
                    today: 'Heute',
                    month: 'Monat',
                    week: 'Woche',
                    day: 'Tag'
                },
                droppable: true, // this allows things to be dropped onto the calendar
                windowResize: function () {
                    var hohe = $(window).height() * 0.58;
                    $('#calendar').fullCalendar('option', 'height', hohe);

                },
                eventClick: function (event, jsEvent, view) {
                    //Hier Events löschen
                },
                businessHours: {
                    start: '10:00', // a start time (10am in this example)
                    end: '18:00', // an end time (6pm in this example)

                    dow: [1, 2, 3, 4, 5]
                    // days of week. an array of zero-based day of week integers (0=Sunday)
                    // (Monday-Thursday in this example)
                },
                eventDrop: function (event) {

                    //Drop von Events ins Backend schreiben
                },
                eventResize: function (event) {
                    //Events größer / kleiner ziehen
                    console.log ("Event resize");

                },
                drop: function (e, f) {
                    //drop von Listenelementen
                    var tableline = f.target.getElementsByTagName("span");
                    var eventname =tableline.item(0).innerText + " " + tableline.item(2).innerText;
                    var dauer = parseInt(tableline.item(7).innerText);


                    var start = new Date();
                    start.setMonth(e.month());
                    start.setDate(e.date());
                    start.setFullYear(e.year());
                    start.setUTCHours((e.hours()));
                    var hilf = start.getUTCHours() -1;
                    start.setUTCHours(hilf);
                    start.setMinutes(e.minutes());

                    var end = new Date();
                    end.setMonth(e.month());
                    end.setDate(e.date());
                    end.setFullYear(e.year());
                    end.setUTCHours((e.hours()) + (dauer - 1) );
                    end.setMinutes(e.minutes());

                    var tableline = f.target.getElementsByTagName("span");
                    var eventname =tableline.item(0).innerText;

                    var eventData = {
                        title: eventname,
                        start: start,
                        end: end
                    };

                    //
                    // is the "remove after drop" checkbox checked?
                    if ($('#drop-remove').is(':checked')) {
                        // if so, remove the element from the "Draggable Events" list
                        $(this).remove();
                    }
                    //ODATA aktualisieren

                    var dateObject = getFormattedDateObject(start,end,tableline.item(4).innerText);

                    var sap_data ={
                        Aufnr: tableline.item(0).innerText,
                        Dauer: tableline.item(7).innerText,
                        Pernr: window.id,
                        Prio: tableline.item(2).innerText,
                        Ktext: tableline.item(3).innerText,
                        Status: tableline.item(5).innerText,
                        Tplatz: tableline.item(6).innerText

                    };

                    $.extend(sap_data, dateObject);

                    console.log(sap_data);

                    $('#calendar').fullCalendar('renderEvent', eventData, true);

                    getSAPToken({
                        successful: function (token) {
                            putAuftragsSet({
                                sucessful: function() {
                                    console.log("Success");
                                },
                                failure: function() {
                                    console.log("Failure");
                                },
                                token: token,
                                data: sap_data
                            })
                        },
                        failure: function () {
                            console.log("Failure 2");
                        }
                    });

                },

                select: function (start, end) {

                    $('#calendar').fullCalendar('unselect');
                }

            }
        );


    },


    Back: function () {

        // navigate back to previous page
        window.history.go(-1);

    }
});