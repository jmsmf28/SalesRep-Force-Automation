var eventsModule = angular.module('eventsModule', []);
var newEventModule = angular.module('newEventModule', ['moment-picker', 'customersModule', 'productsModule']);
var viewEventModule = angular.module('viewEventModule', ['eventsModule', 'productsModule']);

/**
 * EventsController
 */
eventsModule.controller('EventsController', function ($http, $location, $window) {
    var self = this;

    self.events = [];
    self.calendar = null;
    self.eventList = null;
    self.showAll = false;

    /**
     * initiate controller
     */
    self.initCtrl = function (calendarType) {
        self.getEvents();

        if (calendarType == 'min') {
            self.initMinCalendar();
        } else if (calendarType == 'full') {
            self.initFullCalendar();
        }
    };

    /**
     * GET events list from API
     */
    self.getEvents = function () {
        $http.get(API_URL + '/api/Reuniao/').then(function (data) {
                self.events = data.data;
                console.log(data.data);

                // set info to be displayed
                self.events.forEach(function (event) {
                    event.url = '/evento?id=' + event.CodReuniao;
                    event.title = event.Descricao;
                    event.start = event.DataInicio;
                    event.end = event.TodoDia ? undefined : event.DataFim;
                    event.allDay = event.TodoDia;
                });

                if (self.calendar) {
                    self.calendar.fullCalendar('removeEvents');
                    self.calendar.fullCalendar('addEventSource', self.events);
                    self.calendar.fullCalendar('refetchEvents');
                }

                if (self.eventList) {
                    self.eventList.fullCalendar('removeEvents');
                    self.eventList.fullCalendar('addEventSource', self.events);
                    self.eventList.fullCalendar('refetchEvents');
                }
            },
            function (data) {
                console.log("Erro ao listar eventos.");
                console.log(data);
            });
    };

    /**
     * Min/Full calendar and event list handlers
     */
    self.initMinCalendar = function () {
        $(document).ready(function () {
            self.calendar = $('#calendar').fullCalendar({
                header: {
                    left: '',
                    center: 'title',
                    right: ''
                },
                weekends: false,
                selectable: false,
                selectHelper: true,
                editable: false,
                events: self.events,
                eventLimitText: 'eventos'
            });
        });
    };

    self.initFutureEventList = function () {
        $(document).ready(function () {
            self.eventList = $('#upcomming').fullCalendar({
                weekends: false,
                header: {
                    left: '',
                    center: '',
                    right: ''
                },
                views: {
                    listNext: {start: Date.now(), type: 'list', duration: {days: 5}}
                },
                defaultView: 'listNext',
                events: self.events,
                noEventsMessage: 'Não foram encontrados eventos...'
            });
        });
    };

    self.changeView = function () {
        self.showAll = !self.showAll;
        var newView = self.showAll ? 'listYear' : 'listNext';
        self.eventList.fullCalendar('changeView', newView);

        var label = self.showAll ? 'Ver futuros' : 'Ver todos';
        $("#change-view").html(label);
    };

    self.initFullCalendar = function () {
        $(document).ready(function () {
            self.calendar = $('#calendar').fullCalendar({
                weekends: false,
                header: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'month,agendaWeek,agendaDay'
                },
                selectable: true,
                selectHelper: true,
                select: function (start, end, allDay) {
                    self.calendar.fullCalendar('unselect');
                    var date = start._d.getDay() + '-' + start._d.getMonth() + '-' + start._d.getFullYear();
                    $window.location.href = '/criar_evento?data="' + date + '"';
                },
                editable: false,
                events: self.events,
                eventLimitText: 'eventos'
            });
        });
    };
});

/**
 * EventController
 */
eventsModule.controller('EventController', function ($http, $location) {
    var self = this;

    self.event = {};
    self.customer = {};
    self.products = [];
    self.productOpportunities = [];
    self.loadingEvent = true;
    self.loadingCustomer = true;

    /**
     * initiate controller
     */
    self.initCtrl = function (id) {
        self.getEvent(id);
    };

    /**
     * GET event info from API
     */
    self.getEvent = function (id) {
        $http.get(API_URL + '/api/Reuniao/' + id).then(function (data) {
                self.event = data.data;
                console.log(data.data);

                self.getCustomer(self.event.Entidade);

                if(self.event.Oportunidade){
                    self.getProducts();
                    self.getProductOpportunities();
                }
            },
            function (data) {
                console.log("Erro ao obter evento " + id);
                console.log(data);
            });
    };

    /**
     * GET products list from API
     */
    self.getProducts = function () {
        $http.get(API_URL + '/api/artigos').then(function (data) {
            self.products = data.data;
            console.log(self.products);
            self.loading = false;
        }, function (data) {
            console.log('Erro ao obter lista de produtos.');
            console.log(data);
        });
    };

    /**
     * GET product opportunities from API
     */
    self.getProductOpportunities = function () {
        $http.get(API_URL + '/api/OportunidadeVenda/' + self.event.Oportunidade).then(function (data) {
                self.productOpportunities = data.data.Artigos;
                console.log(self.productOpportunities );
            },
            function (data) {
                console.log("Erro ao obter oportunidades de venda " + id);
                console.log(data);
            });
    };

    /**
     * GET customer info from API
     */
    self.getCustomer = function (id) {
        $http.get(API_URL + '/api/Cliente/' + id).then(function (data) {
            self.customer = data.data;
            self.loadingCustomer = false;
            console.log(self.customer);
        }, function (data) {
            console.log('Erro ao obter informação de cliente ' + id);
            console.log(data);
        });
    };

    self.cancelEvent = function (id) {
        $http({
            url: API_URL + '/api/Reuniao/' + id,
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
            data: self.event
        }).then(
            function (data) {
                window.location.replace('/eventos');
            },
            function (data) {
                console.log(data);
            });
    };

    self.isProductOpportunity = function (productId) {
        if (productId) {
            return self.productOpportunities.indexOf(productId) != -1;
        } else {
            return self.productOpportunities.length > 0;
        }
    };
});

/**
 * NewEventController
 */
newEventModule.controller('NewEventController', function ($http) {
    var self = this;

    self.newEvent = {};
    self.salesRep;
    self.eventTypes = [];
    self.newEvent.eventType = null;
    self.productOpportunities = [];
    self.selectedOpportunities = [];
    self.waitingAPIResponse = false;

    /**
     * initiate controller
     */
    self.initCtrl = function (idSalesRep) {
        self.newEvent.CodVendedor = idSalesRep ? idSalesRep : "1";
        self.newEvent.Prioridade = "1";
    };

    /**
     * GET event types list from API
     */
    self.getEventTypes = function () {
        $http.get('api/tipos_evento').then(
            function (data) {
                self.eventTypes = data;
            },
            function (data) {
                console.log(data);
            });
    };

    /**
     * Add event through API
     */
    self.addEvent = function () {
        // TODO add form validation

        // set time variables
        self.newEvent.DataInicio =  self.newEvent.startDate + 'T' + (self.newEvent.TodoDia ? "00:00:00" : self.newEvent.startTime);
        self.newEvent.DataFim =  self.newEvent.startDate + 'T' + (self.newEvent.TodoDia ? "23:59:59" : self.newEvent.endTime);

        // set product opportunities
        self.newEvent.Artigos = self.productOpportunities;

        // set customer ID
        var selectBox = document.getElementById("customer-selector");
        var customerId = selectBox.options[selectBox.selectedIndex].value;
        self.newEvent.Entidade = customerId;

        console.log(self.newEvent);

        self.waitingAPIResponse = true;
        $http({
            method: 'POST',
            url: API_URL + '/api/Reuniao/',
            headers: {'Content-Type': 'application/json'},
            data: self.newEvent
        }).then(
            function (data) {
                console.log(data);
                self.newEvent.CodReuniao = data.data.CodReuniao;

                if(self.productOpportunities.empty) {
                    window.location.replace('/evento?id=' + self.newEvent.CodReuniao);
                }else{
                    self.createSalesOpportunity();
                }
            },
            function (data) {
                console.log(data);
            });
    };

    /**
     * Add event through API
     */
    self.createSalesOpportunity = function () {
        // set customer ID
        var selectBox = document.getElementById("customer-selector");
        var customerId = selectBox.options[selectBox.selectedIndex].value;
        self.newEvent.Entidade = customerId;

        var salesOpportunity = {};
        salesOpportunity.CodReuniao = self.newEvent.CodReuniao;
        salesOpportunity.Descricao = self.newEvent.Descricao;
        salesOpportunity.CodVendedor = self.newEvent.CodVendedor;
        salesOpportunity.Entidade = self.newEvent.Entidade;
        salesOpportunity.Artigos = self.productOpportunities;

        console.log(self.newEvent);
        console.log(salesOpportunity);
        $http({
            method: 'POST',
            url: API_URL + '/api/OportunidadeVenda/',
            headers: {'Content-Type': 'application/json'},
            data: salesOpportunity
        }).then(
            function (data) {
                console.log(data);
                window.location.replace('/evento?id=' + self.newEvent.CodReuniao);
            },
            function (data) {
                console.log(data);
            });
    };

    /**
     * Product opportunities handlers
     */
    self.addOpportunity = function () {
        var selectBox = document.getElementById("product-selector");
        var productId = selectBox.options[selectBox.selectedIndex].value;

        console.log('here');
        console.log(productId);

        // add product to opportunities, if not present already
        if (productId && self.productOpportunities.indexOf(productId) == -1) {
            self.productOpportunities.push(productId);

            $("#product-" + productId).toggle(false);
        }

        var selector = $('#product-selector');
        selector.selectpicker('val', '');
        selector.selectpicker('refresh');
    }

    self.toggleOpportunitySelected = function (id) {
        var index = self.selectedOpportunities.indexOf(id);

        if (index != -1) {
            self.selectedOpportunities.splice(index, 1);
        } else {
            self.selectedOpportunities.push(id);
        }

        console.log(self.selectedOpportunities);
    };

    self.removeOpportunity = function () {

        self.productOpportunities = self.productOpportunities.filter(function (el) {
            if (self.selectedOpportunities.indexOf(el) == -1) {
                return true;
            }

            $("#product-" + el).toggle(true);
            return false;
        });

        self.selectedOpportunities = [];

        var selector = $('#product-selector');
        selector.selectpicker('val', '');
        selector.selectpicker('refresh');
    }

    self.isProductOpportunity = function (productId) {
        if (productId) {
            return self.productOpportunities.indexOf(productId) != -1;
        } else {
            return self.productOpportunities.length > 0;
        }
    };
});

/**
 * EditEventController
 */
newEventModule.controller('EditEventController', function ($http, $location) {
    var self = this;

    self.event = {};
    self.eventTypes = eventTypesTemp;
    self.productOpportunities = [];
    self.selectedOpportunities = [];

    /**
     * initiate controller
     */
    self.initCtrl = function (idEvent) {
        // self.getEvent(id);
        //self.getEventTypes();
    };

    /**
     * GET event info from API
     */
    self.getEvent = function (id) {
        $http.get('api/eventos?id=' + id).then(function (data) {
            self.event = data;

            //TODO add product opportunities
        })
    };

    /**
     * GET event types list from API
     */
    self.getEventTypes = function () {
        $http.get('api/tipos_evento').then(
            function (data) {
                self.eventTypes = data;
                self.newEvent.eventType = self.eventTypes[0];
            },
            function (data) {
                console.log(data);
            });
    };

    /**
     * Save event through API
     */
    self.saveEvent = function () {
        // TODO add form validation; change

        $http.get(API_URL + '/api/Reuniao/' + id, self.event).then(function (data) {
                self.event = data.data;
            },
            function (data) {
                console.log("Erro ao obter evento " + id);
                console.log(data);
            });
    };

    /**
     * Product opportunities handlers
     */
    self.addOpportunity = function () {
        var selectBox = document.getElementById("product-selector");
        var productId = selectBox.options[selectBox.selectedIndex].value;

        // add product to opportunities, if not present already
        if (productId && self.productOpportunities.indexOf(productId) == -1) {
            self.productOpportunities.push(productId);

            $("#product-" + productId).toggle(false);
        }

        var selector = $('#product-selector');
        selector.selectpicker('val', '');
        selector.selectpicker('refresh');
    }

    self.toggleOpportunitySelected = function (id) {
        var index = self.selectedOpportunities.indexOf(id);

        if (index != -1) {
            self.selectedOpportunities.splice(index, 1);
        } else {
            self.selectedOpportunities.push(id);
        }
    };

    self.removeOpportunity = function () {

        self.productOpportunities = self.productOpportunities.filter(function (el) {
            if (self.selectedOpportunities.indexOf(el) == -1) {
                return true;
            }

            $("#product-" + el).toggle(true);
            return false;
        });

        self.selectedOpportunities = [];

        var selector = $('#product-selector');
        selector.selectpicker('val', '');
        selector.selectpicker('refresh');
    }

    self.isProductOpportunity = function (productId) {
        if (productId) {
            return self.productOpportunities.indexOf(productId) != -1;
        } else {
            return self.productOpportunities.length > 0;
        }
    };
});