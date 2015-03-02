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
    var tag = start_of_start_day.toISOString();


    var zeit2 = "PT"+("00"+end.getHours()).slice(-2)+"H"+("00"+end.getMinutes()).slice(-2)+"M"+("00"+end.getSeconds()).slice(-2)+"S";
    var start_of_end_day = new Date(end.getTime());
    start_of_end_day.setHours(0,0,0,0);
    var tag2 = start_of_end_day.toISOString();

    var t_item_4 = new Date(table_item_4_text);
    t_item_4.setHours(0,0,0,0);
    var tag3 = t_item_4.toISOString();

    return {
        Termin: tag3,
        Sdate: tag,
        Suzeit: zeit,
        Edate: tag2,
        Euzeit: zeit2
    }
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

                    window.data ={
                        Aufnr: tableline.item(0).innerText,
                        Dauer: tableline.item(7).innerText,
                        Pernr: window.id,
                        Prio: tableline.item(2).innerText,
                        Ktext: tableline.item(3).innerText,
                        Status: tableline.item(5).innerText,
                        Tplatz: tableline.item(6).innerText

                    };

                    $.extend(window.data, dateObject);

                    console.log(window.data);

                    $('#calendar').fullCalendar('renderEvent', eventData, true);



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