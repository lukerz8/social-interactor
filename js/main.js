$(function(){
    interactor.init();
});

var interactor = (function() {
    //var remoteUrl = 'https://nuvi-challenge.herokuapp.com/activities';
    var remoteUrl = 'data/test-01.json';

    var feedData = {};

    function parseDataItem(data) {
        feedData[data.id] = data;
        addToFeed(data);
    }

    function addToFeed(data){

        var post = $("<li/>", {
            'class':'list-group-item post-container',
            'id':data.id
        });
        var header  = $('<div/>',{ 'class':'post-header' });
        var body    = $('<div/>',{ 'class':'post-body' });
        var footer  = $('<div/>',{ 'class':'post-footer' });
        
        var avator  = $('<img/>', {
            'class':'avator',
            'src':data.actor_avator,
            'alt':data.actor_username + ' avator'
        });

        var author  = $('<h3/>', {
            'class': 'author',
            'text': data.actor_name
        });

        var username = $('<small/>', {
            'text': ' @'+data.actor_username //todo: should the @ always be there?
        });

        if(data.activity_attachment !== null && data.activity_attachment_type === 'image/jpeg') {
            var bodyImg = $('<img/>', {
                'class':'body-img',
                'src':data.activity_message
                //,'alt':'?'
            });
            $(body).append(bodyImg);
        } else {
            $(body).text(data.activity_message);
        }


        $(author).append(username);
        $(header).append(avator, author);

        $(post).append(header, body, footer);
        $('#feed-container').append(post);
    }

    //function getFeedEl() {  }

    return {
        init: function() {
            var getReq = $.getJSON(remoteUrl, function(data){
                if(data.length > 0) {
                    data.forEach(parseDataItem);
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

