$(function(){

    var data = interactor.getData();
    /*
    var retData = {};

    $.getJSON(
        'data/test-01.json',
        function(data) {
            retData = data;
        });

    console.log(retData);
    */

    //console.log(data);
    //$('#main-container').text(data);
});

var interactor = (function() {

    function getNuviData() {
        //var remoteUrl = 'https://nuvi-challenge.herokuapp.com/activities';
        var remoteUrl = 'data/test-01.json';
        var ret = {};
        $.getJSON(remoteUrl, function(data){
            console.log(data);
            ret = data;
        });

        return ret;
    }

    return {
        getData: function() {
            return getNuviData();
        }
    };


})();



// Link: <https://nuvi-challenge.herokuapp.com/activities>