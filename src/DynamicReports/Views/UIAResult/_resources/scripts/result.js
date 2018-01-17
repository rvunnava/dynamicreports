$(document).ready(function () {

    var hash = window.location.hash;
    route = hash.split('#')[1] || "";

    var dom = new ReportDom();

    routes(dom);

    if (route.length <= 0) {
        window.location.hash = '#/suite';
    }
    else {
        crossroads.parse(route);
    }
});


var app = {
    data:{}
}

var ReportDom = function() {
    this.sReportHeader= ".report-header";
    this.sReportBody = ".report-body";
}

function routes(dom) {

    crossroads.addRoute("/suite/{?query}", function (query) {
        //load Left Panel
        debugger;
        $(dom.sReportHeader).empty();
        $(dom.sReportBody).empty();
        geJSON("/../" + query.path).then(function (data) {
            app.data = data;
            getHTML("/views/UIAResult/templates.html").then(function (template) {
                var headerContent = $("<template></template>").append(template)
                    .find("#report-header").html();
                var reportContent = $("<template></template>").append(template)
                    .find("#report-content").html();

                var header = Mustache.render(headerContent, getHeaderModel(data));
                var testList = getTestModel(data.suite);
                var thumbNailContainer = Mustache.render(reportContent, testList);
                $(dom.sReportBody).append(thumbNailContainer);
                $(dom.sReportHeader).append(header);
            });
        });        
    });

    crossroads.addRoute('/test/{id}', function (testID) {
        
        $(dom.sReportHeader).empty();
        $(dom.sReportBody).empty();

        getHTML("/views/UIAResult/templates.html").then(function (template) {
            var templateTestDetailsHeader = $("<template></template>").append(template)
                .find("#test-details-header").html();
            var templateTestDetailsBody = $("<template></template>").append(template)
                .find("#test-details-body").html();

            var arr = app.data.suite.testList;
            var testResult = $.grep(arr, function (e) { return e.id == testID; })[0];
            var testDetailsHeader = Mustache.render(templateTestDetailsHeader, testResult)
            var testDetailsBody = Mustache.render(templateTestDetailsBody, testResult);
            $(dom.sReportHeader).append(testDetailsHeader);
            $(dom.sReportBody).append(testDetailsBody);
        });

    });// route testpad/card/{id}

    window.addEventListener('hashchange', function () {
        var route = "/";
        var hash = window.location.hash;
        if (hash.length > 0) {
            route = hash.split('#').pop();
        }
        crossroads.parse(route);
    });
}




function getHeaderModel(data){
    var objHeaders = {
        headers: {
            environment: data.headers.Environment,
            browser: data.headers.Browser,
            dtTime: new Date()
        }
    }
    return objHeaders;

}

function getTestModel(data) {
    var testList = [];

    data.testList.forEach(function (test) {
        
        var statusClass;
        switch (test.status.toLowerCase()) {
            case "fail":
                statusClass= "danger";
                break;
            case "pass":
                statusClass= "danger";
                break;
            case "exception":
                statusClass = "warning";
                break;
        }

        var testItem = {
            id: test.id,
            name: test.name,
            description: test.description,
            statusClass: statusClass,
            status: test.status
        }
        testList.push(testItem);
    });
    
    var obj = {
        testList: testList
    }

    return obj;

}

function getHTML (url) {
    var d = new $.Deferred();        
    $.ajax({
        url: url,
        data: { /*data*/ },
        dataType: 'html',
        async: true
    }).done(function (html) {                            
        d.resolve(html);
    }).fail(function (error) {
        d.resolve(false);
        console.log('the page ' + url + ' is not loaded', error);
    });
    return d.promise();
}

function geJSON(url) {    
    var d = new $.Deferred();
    $.ajax({
        url: url,
        data: { /*data*/ },
        dataType: 'json',
        async: true
    }).done(function (json) {
        d.resolve(json);
    }).fail(function (error) {
        d.resolve(false);
        console.log('the page ' + url + ' is not loaded', error);
    });
    return d.promise();
}

