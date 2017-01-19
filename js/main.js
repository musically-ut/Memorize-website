function mb(x, def) {
    return (typeof x === 'undefined') ? def : x;
}

var eps = 1e-6;

function update_till_time(dst_arr, src_arr, idx, end_time) {
    var last_value = dst_arr.length > 0 ? dst_arr[dst_arr.length - 1].value : 0;

    while (idx < src_arr.length &&
           src_arr[idx][0] < end_time) {

        // simulate a step change.
        dst_arr.push({
            time: src_arr[idx][0] - eps,
            value: last_value
        });

        dst_arr.push({
            time: src_arr[idx][0],
            value: src_arr[idx][1]
        });

        last_value = src_arr[idx][1];
        idx += 1;
    }

    return idx;
}

var feed_vis = function () {
    /* Visualize the feed of the user. */
    var feed_length = 50;
    var width = 100, height = 150;
    var tweet_height = height / (feed_length + 3), tweet_width = 50;
    var tweet_colors = {
        'user':  '#EFA856',   // '#1E90FF',
        'other': '#4AB3C1'    // '#FF008B'
    };

    function tweet_flow(selection) {
        selection.each(function (tweet_list, i) {
            /* a tweet_list looks like the following:
             * [ { 'id': <number>, 'source': 'other' | 'user' } ]
             */
            var tweets = d3.select(this)
                           .selectAll('rect.tweet')
                           .data(tweet_list.slice(0, feed_length),
                                 function (tweet) { return tweet.id; });

            tweets.enter()
                .append('rect')
                .attr('class', 'tweet')
                .attr('x',
                    function (d, i) {
                        // If the source is 'user', enter from left, else from
                        // right.
                        return d.source === 'user' ? 0 : 100 - tweet_width / 2;
                    })
                .attr('y', 0)
                .attr('width', tweet_width / 2)
                .attr('height', tweet_height / 2)
                .attr('fill', function (d) { return tweet_colors[d.source]; })
                .attr('stroke', 'rgba(0, 0, 0, 0.25)')
                .attr('stroke-width', 0.5)
                .attr('opacity', 1e-6)
              .merge(tweets)
                .transition()
                .attr('x', (width - tweet_width) / 2) // Centers tweets
                .attr('y', function (d, i) { return tweet_height * (i + 1); })
                .attr('width', tweet_width)
                .attr('height', tweet_height)
                .attr('opacity', 1.0);

            tweets.exit()
                .transition()
                .attr('y', function (d, i) { return tweet_height * (i + 2); })
                .attr('opacity', 1e-6)
                .remove();
        });
    }

    tweet_flow.feed_length = function (_) {
        if (!arguments.length) return feed_length;
        feed_length = _;
        return tweet_flow;
    };

    return tweet_flow;
};

var perf_vis = function () {
    /* Visualize the performance of one algorithm. */
    var margins = {
        left: 50,
        right: 10,
        top: 10,
        bottom: 50
    };

    var width = 300 - margins.left - margins.right,
        height = 100 - margins.top - margins.bottom;

    var max_value = 5;

    var scaled_final_time = 100;

    var xScale = d3.scaleLinear()
                    .range([0, width])
                    .domain([0, scaled_final_time]);

    var yScale = d3.scaleLinear()
                    .range([height, 0])
                    .domain([0, max_value]);

    var xAxis = d3.axisBottom()
                    .scale(xScale);

    var yAxis = d3.axisLeft()
                    .scale(yScale)
                    .ticks(4);

    var xLabel = 'Time',
        yLabel = 'Rank';

    var area = d3.area()
                .x(function (d) { return xScale(d.time); })
                .y0(height)
                .y1(function (d) { return yScale(d.value); });

    function perf_vis(selection) {
        selection.each(function (performance_numbers, i) {

            /* Add a sole g.chart-container */
            var svg = d3.select(this);

            var init_chart =
                  svg
                    .selectAll('g.chart-container')
                    .data([0])
                  .enter()
                    .append('g')
                    .attr('class', 'chart-container')
                    .attr('transform',
                          'translate(' + margins.left + ',' +
                                         margins.top + ')');

            init_chart
              .append('path')
                .attr('class', 'area-chart');

            init_chart
              .append('g')
                .classed('x', true)
                .classed('axis', true)
                .attr('transform',
                      'translate(' + 0 + ',' +
                                     height + ')');

            init_chart
              .append('g')
                .classed('y', true)
                .classed('axis', true)
                .attr('transform',
                      'translate(' + 0 + ',' + 0 + ')');

            svg.selectAll('.y.label')
                .data([0])
              .enter()
                .append('g')
                .classed('y', true)
                .classed('label', true)
                .attr('transform',
                      'translate(' + (margins.left / 2) + ','
                                   + (margins.top + height / 2) + ')' +
                      'rotate(-90)')
              .append('text')
                .attr('text-anchor', 'middle')
                .attr('dy', '0.35em')
                .text(yLabel)

            svg.selectAll('.x.label')
                .data([0])
              .enter()
                .append('g')
                .classed('x', true)
                .classed('label', true)
                .attr('transform',
                      'translate(' + (margins.left + width / 2) + ','
                                   + (margins.top + height + margins.bottom / 2) + ')')
              .append('text')
                .attr('text-anchor', 'middle')
                .attr('dy', '0.35em')
                .text(xLabel)


            // Updating the chart now.
            yScale = yScale.domain([0, max_value]);
            xScale = xScale.domain([0, scaled_final_time]);

            d3.select(this)
                .select('.x.axis')
                .call(xAxis);

            d3.select(this)
                .select('.y.axis')
                .call(yAxis);

            var chart = d3.select(this)
                          .select('path.area-chart')
                          .datum(performance_numbers)
                          .attr('d', area);
        });
    }

    perf_vis.final_time = function (_) {
        if (!arguments.length) return scaled_final_time;
        scaled_final_time = _;
        return perf_vis;
    };

    perf_vis.max_value = function (_) {
        if (!arguments.length) return max_value;
        max_value = _;
        return perf_vis;
    };

    return perf_vis;
};


fetch('data/example1.json')
.then(function (resp) {
    return resp.json();
})
.then(function (json_data) {
    /* Need to run a timer and constantly update the visualization. */
    var feed_instances = feed_vis();
    var perf_instances = perf_vis();

    var chosen_wall_sink_id = Object.keys(json_data.walls)[0];
    var wall = json_data.walls[chosen_wall_sink_id];
    console.log('Showing the wall for id = ', chosen_wall_sink_id);

    var present_perfs = Object.keys(json_data.broadcasts);
    var chosen_perf_1 = present_perfs[0];
    var chosen_perf_2 = present_perfs[1];
    var perf_1 = json_data.broadcasts[chosen_perf_1];
    var perf_2 = json_data.broadcasts[chosen_perf_2];
    console.log('chosen_perf_1 = ', chosen_perf_1, ' chosen_perf_2 = ', chosen_perf_2);

    var max_real_time = 1 * 60 * 1000; // Run the demo for this long (ms)

    var feed_length = feed_instances.feed_length();
    var scaled_end_time = perf_instances.final_time();

    // Not trying too hard to ensure that the data exported from Python
    // conforms to the scaling we have arbitrarily chosen here.

    // Initialize the state of the visualisation.
    var vis_state = {
        cur_time: 0,
        wall_idx: 0,
        perf_post_idx: [0, 0]
    };

    var tweets_1 = [], tweets_2 = [], timer_id = null, id = 0;
    var perf_1_data = [], perf_1_data_idx = 0;
    var perf_2_data = [], perf_2_data_idx = 0;
    var perf_max_value = 0;

    function update_all_vis(vis_state) {

        // Calculate the next ticks for the three running clocks.
        // If the index is past their end, then assume that the next tick
        // happens at Infinity.
        var next = {
            wall   : mb(wall[vis_state.wall_idx]                     , Infinity),
            perf_1 : mb(perf_1.post_times[vis_state.perf_post_idx[0]], Infinity),
            perf_2 : mb(perf_2.post_times[vis_state.perf_post_idx[1]], Infinity)
        };

        var next_tick = Math.min.apply(null, Object.values(next));
        id += 1;
        var tweet = { id: id };

        if (Number.isFinite(next_tick)) {
            // Carry on only if the next_tick is not Infinity

            if (next.wall < next.perf_1 && next.wall < next.perf_2) {
                // The next tweet was by the rest of the world.
                vis_state.wall_idx += 1;

                tweet.source = 'other';
                tweets_1.unshift(tweet);
                tweets_2.unshift(tweet);

            } else if (next.perf_1 < next.perf_2 && next.perf_1 < next.wall) {
                // The first performance algo made the next post.
                vis_state.perf_post_idx[0] += 1;

                tweet.source = 'user';
                tweets_1.unshift(tweet);

            } else {
                // The second performance algo made the next post.
                vis_state.perf_post_idx[1] += 1;

                tweet.source = 'user';
                tweets_2.unshift(tweet);
            }

            // Updating the feed visualisations.
            tweets_1 = tweets_1.slice(0, feed_length);
            tweets_2 = tweets_2.slice(0, feed_length);

            d3.select('#feed-1-vis').datum(tweets_1).call(feed_instances);
            d3.select('#feed-2-vis').datum(tweets_2).call(feed_instances);

            // Updating the performance visualisations.
            perf_1_data_idx = update_till_time(perf_1_data,
                                               perf_1.performance.avg_rank,
                                               perf_1_data_idx,
                                               next_tick);

            perf_2_data_idx = update_till_time(perf_2_data,
                                               perf_2.performance.avg_rank,
                                               perf_2_data_idx,
                                               next_tick);

            var perf_1_max = d3.max(perf_1_data, function (d) { return d.value; });
            var perf_2_max = d3.max(perf_2_data, function (d) { return d.value; });

            var perf_max = Math.max(perf_1_max || 0, perf_2_max || 0);

            perf_instances.max_value(Math.max(perf_max,
                                              perf_instances.max_value()));

            d3.select('#perf-1-vis').datum(perf_1_data).call(perf_instances);
            d3.select('#perf-2-vis').datum(perf_2_data).call(perf_instances);

            // Getting ready for the next iteration.
            var old_time = vis_state.cur_time;
            vis_state.cur_time = next_tick;

            // This timer_id can be used to stop updates mid-way or to pause
            // or resume.
            // debugger;
            timer_id = setTimeout(
                function () { update_all_vis(vis_state); },
                (next_tick - old_time) / scaled_end_time * max_real_time
            );
        } else {
            /* Take clean up actions here, which should be taken after
             * the visualisation has run its course.
             */
        }
    }

    /* Draw the axis with the first point. */
    update_all_vis(vis_state);
    clearTimeout(timer_id);
    timer_id = null;

    d3.select('.js-play')
        .on('click', function () {
            update_all_vis(vis_state);
        });

    d3.select('.js-stop')
        .on('click', function () {
            if (timer_id !== null) {
                clearTimeout(timer_id);
                timer_id = null;
            }
        });

    // function update_randomly(tweets, id, elem_id) {
    //     var rand = Math.random();
    //     tweets.unshift({
    //         id: id,
    //         source: (rand < 0.25) ? 'user' : 'other'
    //     });
    //     id = id + 1;
    //     tweets = tweets.slice(0, feed_length);
    //     d3.select('#' + elem_id)
    //       .datum(tweets)
    //       .call(tweet_flow);

    //     if (id < 200) {
    //         setTimeout(function () { update_randomly(tweets, id, elem_id); },
    //                    Math.random() * 1000);
    //     }
    // }

    // update_randomly([], 0, 'feed-1-vis');
    // update_randomly([], 0, 'feed-2-vis');
});


