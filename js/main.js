$(function(){
    interactor.init();
});

var interactor = (function() {
    //var remoteUrl = 'https://nuvi-challenge.herokuapp.com/activities';
    var remoteUrl = 'data/test-01.json';

    var feedData = {};

    function addToFeed(data){
        feedData[data.id] = data;

        var cont = $("<li></li>");
        var header = $("<h3></h3>");
        var headLeft = $("<span></span>");
        var headCenter = $("<span></span>");
        var headRight = $("<span></span>");
        
        cont.attr('id', data.id);
        cont.addClass('list-group-item post-container');

        // handlebars.js - http://handlebarsjs.com/





        $('#feed-container').append(div);
    }

    return {
        init: function() {
            var getReq = $.getJSON(remoteUrl, function(data){
                if(data.length > 0) {
                    data.forEach(addToFeed);
                } else { /* todo: no data received event? */ }

            })
              .done(function(){
                  // todo?
              })
              .fail(function(){
                  // todo?
              });
        },
        getFeedData: function() {
            return feedData; // todo: does this need to check to make sure the data has been retrieved first?
        }
    };


})();

