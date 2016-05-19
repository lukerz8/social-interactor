$(function(){
    interactor.init();
});

var interactor = (function() {
    //var remoteUrl = 'https://nuvi-challenge.herokuapp.com/activities';
    var remoteUrl = 'data/test-01.json';

    var feedData = {};

    function parseDataItem(data) {
        // todo: sort data by date, most recent first
        // <http://gabrieleromanato.name/jquery-sorting-json-objects-in-ajax/>
        feedData[data.id] = data;
        addToFeed(data);
    }

    function addToFeed(data){

        var post = $("<div/>", {
            'class':'material post-container',
            'id':data.id
        });
        var postHeader  = $('<div/>',{ 'class':'post-header' });
        var postBody    = $('<div/>',{ 'class':'post-body' });
        var postFooter  = $('<div/>',{ 'class':'post-footer' });
        
        var avator  = $('<img/>', {
            'class':'avator',
            'src':data.actor_avator,
            'alt':data.actor_username + ' avator'
        });

        var author  = $('<h2/>', {
            'class': 'author',
            'text': data.actor_name
        });

        var username = $('<a/>', {
            'class': 'actor-username',
            'href': data.actor_url,
            'target':'_blank',
            'text': '@'+data.actor_username //todo: should the @ always be there?
        });

        if(data.activity_attachment !== null && data.activity_attachment_type === 'image/jpeg') {
            var bodyImg = $('<img/>', {
                'class':'post-img',
                'src':data.activity_message
                //,'alt':'?' //todo
            });
            $(postBody).append(bodyImg);
        } else {
            $(postBody).text(data.activity_message);
        }

        var socIcon = $('<span/>', {
            'class': 'socicon socicon-' + getSocIconType(data.provider)
        });

        $(author).append(username);
        $(postHeader).append(avator, author, socIcon);

        $(post).append(postHeader, postBody, postFooter);
        $('#feed-container').append(post);
    }

    function getSocIconType(provider) {
        switch(provider) {
            case 'facebook':    return 'facebook';  break;
            case 'instagram':   return 'instagram'; break;
            case 'reddit':      return 'reddit';    break;
            case 'tumblr':      return 'tumblr';    break;
            case 'twitter':     return 'twitter';   break;
        }
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

