function parseTweets(runkeeper_tweets) {
    if (runkeeper_tweets === undefined) {
        window.alert('No tweets returned');
        return;
    }

    const tweets = runkeeper_tweets.map(tweet => new Tweet(tweet.text, tweet.created_at));
    const total = tweets.length;
    document.getElementById('numberTweets').innerText = total;

    const earliest = new Date(Math.min(...tweets.map(tweet => tweet.time.getTime())));
    const latest = new Date(Math.max(...tweets.map(tweet => tweet.time.getTime())));
    const formatDate = date => date.toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'
    });
    document.getElementById('firstDate').innerText = formatDate(earliest);
    document.getElementById('lastDate').innerText = formatDate(latest);

    const categories = [
        ['completed_event', 'completedEvents', 'completedEventsPct'],
        ['live_event', 'liveEvents', 'liveEventsPct'],
        ['achievement', 'achievements', 'achievementsPct'],
        ['miscellaneous', 'miscellaneous', 'miscellaneousPct']
    ];
    categories.forEach(([category, countClass, pctClass]) => {
        const count = tweets.filter(tweet => tweet.source === category).length;
        document.querySelectorAll('.' + countClass).forEach(el => el.innerText = count);
        document.querySelectorAll('.' + pctClass).forEach(el => el.innerText =
            (total ? (100 * count / total) : 0).toFixed(2) + '%');
    });

    const completed = tweets.filter(tweet => tweet.source === 'completed_event');
    const written = completed.filter(tweet => tweet.written).length;
    document.querySelectorAll('.written').forEach(el => el.innerText = written);
    document.querySelectorAll('.writtenPct').forEach(el => el.innerText =
        (completed.length ? 100 * written / completed.length : 0).toFixed(2) + '%');
}

document.addEventListener('DOMContentLoaded', function () {
    loadSavedRunkeeperTweets().then(parseTweets);
});
