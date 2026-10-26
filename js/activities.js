function parseTweets(runkeeper_tweets) {
    if (runkeeper_tweets === undefined) {
        window.alert('No tweets returned');
        return;
    }
    const tweets = runkeeper_tweets.map(tweet => new Tweet(tweet.text, tweet.created_at));
    const completed = tweets.filter(tweet => tweet.source === 'completed_event' && tweet.activityType !== 'unknown');
    const counts = {};
    completed.forEach(tweet => {
        counts[tweet.activityType] = (counts[tweet.activityType] || 0) + 1;
    });
    const ordered = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    const topThree = ordered.slice(0, 3);
    document.getElementById('numberActivities').innerText = ordered.length;
    ['firstMost', 'secondMost', 'thirdMost'].forEach((id, i) => {
        document.getElementById(id).innerText = topThree[i] || 'none';
    });

    const frequencyData = ordered.map(activity => ({activity, count: counts[activity]}));
    vegaEmbed('#activityVis', {
        $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
        description: 'Activity frequency',
        data: {values: frequencyData},
        mark: 'bar',
        encoding: {
            x: {field: 'activity', type: 'nominal', sort: '-y', title: 'Activity type'},
            y: {field: 'count', type: 'quantitative', title: 'Number of tweets'},
            tooltip: [{field: 'activity'}, {field: 'count'}]
        }, width: 650, height: 320
    }, {actions: false});

    const distances = completed.filter(tweet => topThree.includes(tweet.activityType) && tweet.distance > 0)
        .map(tweet => ({
            activity: tweet.activityType,
            distance: tweet.distance,
            day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][tweet.time.getUTCDay()],
            weekend: [0, 6].includes(tweet.time.getUTCDay())
        }));
    const dayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const commonEncoding = {
        x: {field: 'day', type: 'ordinal', sort: dayOrder, title: 'Day of week'},
        y: {field: 'distance', type: 'quantitative', title: 'Distance (miles)'},
        color: {field: 'activity', type: 'nominal', title: 'Activity type'}
    };
    const base = { $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
        data: {values: distances}, width: 650, height: 300 };
    vegaEmbed('#distanceVis', {
        ...base, mark: {type: 'point', opacity: 0.4},
        encoding: {...commonEncoding, tooltip: [{field: 'activity'}, {field: 'day'}, {field: 'distance', format: '.2f'}]}
    }, {actions: false});
    vegaEmbed('#distanceVisAggregated', {
        ...base, mark: 'bar',
        encoding: {...commonEncoding,
            xOffset: {field: 'activity'},
            y: {field: 'distance', type: 'quantitative', aggregate: 'mean', title: 'Mean distance (miles)'},
            tooltip: [{field: 'activity'}, {field: 'day'}, {field: 'distance', aggregate: 'mean', format: '.2f'}]}
    }, {actions: false});

    // Show the activity with the greatest/least average distance of the top three.
    const averages = topThree.map(activity => {
        const entries = distances.filter(d => d.activity === activity);
        return {activity, mean: entries.length ? entries.reduce((sum, d) => sum + d.distance, 0) / entries.length : 0};
    }).sort((a, b) => b.mean - a.mean);
    document.getElementById('longestActivityType').innerText = averages[0]?.activity || 'none';
    document.getElementById('shortestActivityType').innerText = averages[averages.length - 1]?.activity || 'none';
    const weekdays = distances.filter(d => !d.weekend);
    const weekends = distances.filter(d => d.weekend);
    const mean = values => values.length ? values.reduce((sum, d) => sum + d.distance, 0) / values.length : 0;
    document.getElementById('weekdayOrWeekendLonger').innerText = mean(weekends) > mean(weekdays) ? 'weekends' : 'weekdays';

    const raw = document.getElementById('distanceVis');
    const aggregated = document.getElementById('distanceVisAggregated');
    const button = document.getElementById('aggregate');
    aggregated.style.display = 'none';
    button.addEventListener('click', () => {
        const showMeans = aggregated.style.display === 'none';
        aggregated.style.display = showMeans ? 'block' : 'none';
        raw.style.display = showMeans ? 'none' : 'block';
        button.innerText = showMeans ? 'Show individual distances' : 'Show means';
    });
}

document.addEventListener('DOMContentLoaded', function () {
    loadSavedRunkeeperTweets().then(parseTweets);
});
