var chartApp = angular.module('chartApp', ['d3']);

chartApp.directive('d3Bars', ['d3Service', function(d3Service) {
    return {
      restrict: 'EA',
      // directive code
      scope: {},
      link: function(scope, element, attrs){
        d3Service.d3().then(function(d3) {
          // d3 is the raw d3 object
            var dataset, allData;
            function chart(dataset){
                var w = 550,
                    h = 500,
                    padding = 25;

                var yScale = d3.scale.linear()
                    .domain(d3.extent(dataset, function(d){return d.pnl;}))
                    .range([h, padding]);

                var xScale = d3.scale.ordinal()
                    .domain(dataset.map(function(d){return d.date;}))
                    .rangeRoundBands([padding, h+padding+10], .5)

                //To format axis
                var format$ = d3.format("$");

                //Create y axis
                var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(5).tickFormat(format$);

                //Create key function
                var key = function(d){return d.date};

                //Define tooltip for hover-over info windows
                var div = d3.select("body").append("div")   
                                    .attr("class", "tooltip")               
                                    .style("opacity", 0)

                //Create svg element
                var svg = d3.select("#svg-container").append("svg")
                        .attr("width", w).attr("height", h)
                        .attr("id", "chart")
                        .attr("viewBox", "0 0 "+w+ " "+h)
                        .attr("preserveAspectRatio", "xMinYMin");

                //Initialize state of chart according to drop down menu
                var state = d3.selectAll("option");

                //Create barchart
                svg.selectAll("rect")
                    .data(dataset, key)
                    .enter()
                    .append("rect")
                    .attr("class", function(d){return d.pnl < 0 ? "negative" : "positive";})
                    .attr({
                        x: function(d){
                            return xScale(d.date);
                        },
                        y: function(d){
                            return yScale(Math.max(0, d.pnl)); 
                        },
                        width: xScale.rangeBand(),
                        height: function(d){
                            return Math.abs(yScale(d.pnl) - yScale(0)); 
                        }
                    })
                    .on('mouseover', function(d){
                        d3.select(this)
                            .style("opacity", 0.2)
                            .style("stroke", "black")
                
                        var info = div
                                    .style("opacity", 1)
                                    .style("left", (d3.event.pageX+10) + "px")
                                    .style("top", (d3.event.pageY-30) + "px")
                                    .text(d.date);

                            info.append("p")
                                    .text(format$(d.pnl));


                        })
                        .on('mouseout', function(d){
                            d3.select(this)
                            .style({'stroke-opacity':0.5,'stroke':'#a8a8a8'})
                            .style("opacity",1);

                            div.style("opacity", 0);
                        });

                    //Add y-axis
                    svg.append("g")
                        .attr("class", "y axis")
                        .attr("transform", "translate(40,0)")
                        .call(yAxis);

                    //Function to sort data when sort box is checked
                    function sortChoice(){
                            var state = d3.selectAll("option");
                            var sort = d3.selectAll(".checkbox");

                            if(sort[0][0].checked){
                                var out = function(a,b){return b.pnl - a.pnl;}
                                return out;
                            } else {
                                var out = function(a,b){return d3.ascending(a.date, b.date);}
                                return out;  
                            }
                    };

                    //Sort data when sort is checked
                    d3.selectAll(".checkbox").
                    on("change", function(){
                        var x0 = xScale.domain(dataset.sort(sortChoice())
                        .map(function(d){return d.date}))
                        .copy();

                        var transition = svg.transition().duration(750);
                        var delay = function(d, i){return i*10;};

                        transition.selectAll("rect")
                        .delay(delay)
                        .attr("x", function(d){return x0(d.date);});
                    })
            }

            allData = data
            var curData = data.timeseries.slice(0, 60);
            dataset = curData;
            chart(dataset);

            d3.selectAll("select").
                on("change", function(){
                    d3.select("svg").remove()
                    var value = +this.value;
                    newData = allData.timeseries.slice(value*60, (value+1)*60)
                    chart(newData); 
                })
        });
      }
    }
  }]);