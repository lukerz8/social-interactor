$(function(){
    interactor.init();
});

var interactor = (function() {
    //var remoteUrl = '//nuvi-challenge.herokuapp.com/activities';
    var remoteUrl = 'data/test-01.json';

    var feedData = {};

    function parseData(data) {
        // todo: sort data by date, most recent first
        /*
        I'm just going to use JS promises, because:
         1. Desktop browser support is very good - <http://caniuse.com/#feat=promises>
         2. for the love of god stop using IE...

         Help from here: <https://davidwalsh.name/write-javascript-promises>
         */

        feedData[data.id] = data;
        //addToFeed(data);
    }

    function addToFeed(data){
        var post = $("<div/>", {
            'class':'material post-container',
            'id':data.id
        });
        var postHeader  = $('<div/>',{ 'class':'post-header' });
        var postBody    = $('<div/>',{ 'class':'post-body' });
        var postFooter  = $('<div/>',{ 'class':'post-footer' });

        /******** Post Header Elements ********/

        var avator = $('<img/>', {
            'class':'avator',
            'src':data.actor_avator,
            'alt':data.actor_username + ' avator'
        });
        
        var authorCont = $('<div/>', { 'class': 'actor-container' });

        var authorName = $('<h2/>', {
            'class': 'actor-name',
            'text': data.actor_name
        });

        var username = $('<a/>', {
            'class': 'actor-username',
            'href': data.actor_url,
            'target':'_blank',
            'text': '@'+data.actor_username //todo: should the @ always be there?
        });
        
        var authorDesc = $('<h3/>', {
            'class': 'actor-desc',
            'text': data.actor_description
        });

        /** Combine Author Elements **/
        $(authorCont).append(authorName, username, authorDesc);

        var postDate = $('<span/>', {
            'class': 'post-date',
            'text': formatPostDate(data.activity_date)
        });

        var socIcon = $('<span/>', {
            'class': 'fa fa-' + getSocIconType(data.provider)
        });

        /** Combine Header Elements **/
        $(postHeader).append(avator, authorCont, socIcon, postDate);

        /******** Post Body Elements ********/

        // Check for post attachment
        if(data.activity_attachment !== null && data.activity_attachment_type === 'image/jpeg') {
            var bodyImgCont  = $('<a/>', {
                'class': 'post-img-container',
                'href': data.activity_attachment,
                'target': '_blank'
            });

            var bodyImg = $('<img/>', {
                'class':'post-img',
                'src':data.activity_attachment
            });

            $(bodyImgCont).append(bodyImg);
            $(postBody).append(bodyImgCont);

            // just in case there's a message in addition to the attachment...
            if(data.activity_message.trim() !== data.activity_attachment.trim()) {
                var bodyTxt = $('<p/>', { 'text':data.activity_message });
                $(postBody).append(bodyTxt);
            }

        } else {
            $(postBody).text(data.activity_message);
        }

        /******** Post Footer Elements ********/

        // Thanks w3Schools for the tool"tip" <http://www.w3schools.com/css/css_tooltip.asp> ;D

        var sentiment = $('<span/>', {
            'class': 'activity-icon icon-sentiment tooltip fa fa-' + getSentimentType(data.activity_sentiment),
            'html': '<span class="material tooltiptext tooltip-bottom">Sentiment</span>'
        });

        var likes = $('<span/>', {
            'class': 'activity-icon tooltip fa fa-thumbs-o-up',
            'html': '&nbsp;' + data.activity_likes + 
                '<span class="material tooltiptext tooltip-bottom">Likes</span>'
        });

        var shares = $('<span/>', {
            'class': 'activity-icon tooltip fa fa-retweet',
            'html': '&nbsp;' + data.activity_shares +
                '<span class="material tooltiptext tooltip-bottom">Shares</span>'
        });

        var comments = $('<span/>', {
            'class': 'activity-icon tooltip fa fa-comment-o',
            'html': '&nbsp;' + data.activity_comments +
            '<span class="material tooltiptext tooltip-bottom">Comments</span>'
        });

        var url = $('<a/>', {
            'class': 'activity-icon tooltip fa fa-external-link',
            'href': data.activity_url,
            'target': '_blank',
            'html': '<span class="material tooltiptext tooltip-bottom">View Post</span>'

        });

        $(postFooter).append(sentiment, likes, shares, comments, url);

        /** Combine and Append Post to Feed Container **/

        $(post).append(postHeader, postBody, postFooter);
        $('#feed-container').append(post);
    }

    function getSocIconType(provider) {
        switch(provider) {
            case 'facebook':    return 'facebook';      break;
            case 'instagram':   return 'instagram';     break;
            case 'reddit':      return 'reddit-alien';  break;
            case 'tumblr':      return 'tumblr';        break;
            case 'twitter':     return 'twitter';       break;
            default:            return 'question';
        }
    }

    function getSentimentType(sentiment) {
        if(sentiment < 0)       { return 'frown-o'; }
        else if(sentiment > 0)  { return 'smile-o'; }
        else                    { return 'meh-o'; }
    }

    // if the data source is down or no data is received...
    function msgNoData(errMsg) {
        if(errMsg.length == 0) { errMsg = "Unknown Error"; }

        var post = $("<div/>", {
            'class':'material post-container post-error',
            'html':"<h3>No Data Received: " + errMsg + "</h3>"
        });


        $('#feed-container').append(post);
    }

    // Could update this to prettier date later; keeping it simple for now
    function formatPostDate(dateStr) {
        var d = new Date(dateStr);
        return (d.getMonth() + 1) + '/' + d.getDate() + '/' + (d.getFullYear());
    }

    function sortRawData(data, prop, direction) {
        return data.sort(function(a, b){
            if(a[prop] == b[prop]){ return 0; }
            else { return a[prop] < b[prop] ? -1 * direction : 1 * direction; }
        });
    }

    return {
        getData: function() {
            return $.getJSON(remoteUrl)
            .fail(function() {
                msgNoData("Request Failed");
                return -1;
            })
            .then(function(data) {
                if(data.length > 0) {
                    return sortRawData(data, 'activity_date', 1);
                } else {
                    msgNoData("There are no posts");
                    return -1;
                }
            });
        },
        init: function() {
            this.getData().done(function(data){
                if(data !== -1 && data.length > 0) {
                    feedData = data;
                    data.forEach(addToFeed);
                } else {
                    // Shouldn't get here (famous last words...)
                    msgNoData();
                }
            });
        }
    };
})();

// May need to use this for sorting later - <http://stackoverflow.com/a/4698083/5121100>

