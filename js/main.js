$(function(){
    /*
    $.when(interactor.init()).done(function(){
        console.log("testing done");
    });
    */
    interactor.init();
});

var interactor = (function() {
    var remoteUrl = '//nuvi-challenge.herokuapp.com/activities';
    //var remoteUrl = 'data/test-01.json';

    var feedData = {};

    function getRawData() {
        /*
         I'm just going to use JS promises, because:
         1. Desktop browser support is very good - <http://caniuse.com/#feat=promises>
         2. for the love of god stop using IE...

         Help from here: <https://davidwalsh.name/write-javascript-promises>
         */
        return $.getJSON(remoteUrl)
            .fail(function() {
                msgNoData("Request Failed");
                return -1;
            })
            .then(function(data) {
                if(data.length > 0) {
                    return sortData(data, 'activity_date', -1);
                } else {
                    msgNoData("There are no posts");
                    return -1;
                }
            });
    }

    function sortData(data, prop, direction) {
        return data.sort(function(a, b){
            var item1; var item2;

            switch(prop) {
                case "activity_date":
                    item1 = Date.parse(a[prop]);
                    item2 = Date.parse(b[prop]);
                    break;
                case "id":
                    item1 = parseInt(a[prop]);
                    item2 = parseInt(b[prop]);
                    break;
                default:
                    item1 = a[prop];
                    item2 = b[prop];
            }

            if(typeof item1 === 'string' && typeof item2 === 'string') {
                item1 = item1.toLowerCase();
                item2 = item2.toLowerCase();
            }

            if(item1 == item2){ return 0; }
            else { return item1 < item2 ? -1 * direction : 1 * direction; }
        });
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
            'html': '<span class="tooltiptext tooltip-bottom">Sentiment</span>'
        });

        var likes = $('<span/>', {
            'class': 'activity-icon tooltip fa fa-thumbs-o-up',
            'html': '&nbsp;' + data.activity_likes +
                '<span class="tooltiptext tooltip-bottom">Likes</span>'
        });

        var shares = $('<span/>', {
            'class': 'activity-icon tooltip fa fa-retweet',
            'html': '&nbsp;' + data.activity_shares +
                '<span class="tooltiptext tooltip-bottom">Shares</span>'
        });

        var comments = $('<span/>', {
            'class': 'activity-icon tooltip fa fa-comment-o',
            'html': '&nbsp;' + data.activity_comments +
            '<span class="tooltiptext tooltip-bottom">Comments</span>'
        });

        var url = $('<a/>', {
            'class': 'activity-icon tooltip fa fa-external-link',
            'href': data.activity_url,
            'target': '_blank',
            'html': '<span class="tooltiptext tooltip-bottom">View Post</span>'

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

    // Could update this to prettier date later; keeping it simple for now
    function formatPostDate(dateStr) {
        var d = new Date(dateStr);
        return (d.getMonth() + 1) + '/' + d.getDate() + '/' + (d.getFullYear());
    }

    function getSourceData() {
        var ret = [
            { label: 'Facebook',    count: 0, color: '#3e5b98' },
            { label: 'Instagram',   count: 0, color: '#000000' },
            { label: 'Reddit',      count: 0, color: '#e74a1e' },
            { label: 'Tumblr',      count: 0, color: '#45556c' },
            { label: 'Twitter',     count: 0, color: '#4da7de' },
            { label: 'Other',       count: 0, color: '#808080' }
        ];

        feedData.forEach(function(element){
            switch(element.provider) {
                case 'facebook':    ret[0].count++; break;
                case 'instagram':   ret[1].count++; break;
                case 'reddit':      ret[2].count++; break;
                case 'tumblr':      ret[3].count++; break;
                case 'twitter':     ret[4].count++; break;
                default:            ret[5].count++;
            }
        });

        // filter out media sources with a count of 0 and return data
        return ret.filter(function(element) { return element.count !== 0; });
    }

    function addDataCharts() {
        var postSourceData = getSourceData();

        addChartItem(postSourceData);
    }
    
    function addChartItem(dataset) {
        interactorChartHelper.appendDonutChart(dataset);
    }

    return {
        init: function() {
            getRawData().done(function(data){
                if(data !== -1 && data.length > 0) {
                    feedData = data;
                    $.when(data.forEach(addToFeed)).done(function(){
                        addDataCharts();
                    });
                } else {
                    // Shouldn't get here (famous last words...)
                    msgNoData();
                }
            });
        }
    };
})();

// This is based on my experiment here: <http://codepen.io/bluesaltlabs/pen/oxKjLG>,
// which was completely derived from here: <http://zeroviscosity.com/d3-js-step-by-step/step-1-a-basic-pie-chart>
var interactorChartHelper = (function(){
    var width = 360;
    var height = 360;
    var radius = Math.min(width, height) / 2;
    var donutWidth = 75;
    var legendRectSize = 18;
    var legendSpacing = 4;

    function getColors(dataArr) {
        if(dataArr.length > 0) {
            var colorsArr = [];
            dataArr.forEach(function(el){ colorsArr.push(el.color); });

            return d3.scale.ordinal().range(colorsArr);
        } else {
            return d3.scale.category20b();
        }
    }

    return {
        appendDonutChart: function(dataset) {
            var color = getColors(dataset);

            var svg = d3.select('#data-container')
                .append('svg')
                .attr('width', width)
                .attr('height', height)
                .append('g')
                .attr('transform', 'translate(' + (width / 2) +  ',' + (height / 2) + ')');

            var arc = d3.svg.arc()
                .innerRadius(radius - donutWidth)
                .outerRadius(radius);

            var pie = d3.layout.pie()
                .value(function(d) { return d.count; })
                .sort(null);

            var path = svg.selectAll('path')
                .data(pie(dataset))
                .enter()
                .append('path')
                .attr('d', arc)
                .attr('fill', function(d, i) {
                    return color(d.data.label);
                })
                .each(function(d) { this._current = d; });

            path.on('mouseover', function(d) {
                var total = d3.sum(dataset.map(function(d) {
                    return d.count;
                }));
                var percent = Math.round(1000 * d.data.count / total) / 10;
                tooltip.select('.label').html(d.data.label);
                tooltip.select('.count').html(d.data.count);
                tooltip.select('.percent').html(percent + '%');
                tooltip.style('display', 'block');
            });

            path.on('mouseout', function(d) {
                tooltip.style('display', 'none');
            });
            
            var legend = svg.selectAll('.legend')
                .data(color.domain())
                .enter()
                .append('g')
                .attr('class', 'legend')
                .attr('transform', function(d, i) {
                    var height = legendRectSize + legendSpacing;
                    var offset =  height * color.domain().length / 2;
                    var horz = -2 * legendRectSize;
                    var vert = i * height - offset;
                    return 'translate(' + horz + ',' + vert + ')';
                });

            var tooltip = d3.select('#data-container')
                .append('div')
                .attr('class', 'd3tooltip');

            tooltip.append('div')
                .attr('class', 'label');

            tooltip.append('div')
                .attr('class', 'count');

            tooltip.append('div')
                .attr('class', 'percent');


            legend.append('rect')
                .attr('width', legendRectSize)
                .attr('height', legendRectSize)
                .style('fill', color)
                .style('stroke', color);

            legend.append('text')
                .attr('x', legendRectSize + legendSpacing)
                .attr('y', legendRectSize - legendSpacing)
                .text(function(d) { return d; });
        }
    };
})();
