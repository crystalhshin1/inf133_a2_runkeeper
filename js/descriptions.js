let writtenTweets = [];

function parseTweets(runkeeper_tweets) {
    if (runkeeper_tweets === undefined) {
        window.alert('No tweets returned');
        return;
    }
    writtenTweets = runkeeper_tweets.map(tweet => new Tweet(tweet.text, tweet.created_at))
        .filter(tweet => tweet.written);
    updateSearch();
}

function updateSearch() {
    const query = document.getElementById('textFilter').value.trim().toLowerCase();
    const table = document.getElementById('tweetTable');
    document.getElementById('searchText').textContent = query;
    if (!query) {
        table.innerHTML = '';
        document.getElementById('searchCount').textContent = '0';
        return;
    }
    const matches = writtenTweets.filter(tweet => tweet.writtenText.toLowerCase().includes(query));
    document.getElementById('searchCount').textContent = String(matches.length);
    table.innerHTML = matches.map((tweet, i) => tweet.getHTMLTableRow(i + 1)).join('');
}

function addEventHandlerForSearch() {
    document.getElementById('textFilter').addEventListener('input', updateSearch);
}

document.addEventListener('DOMContentLoaded', function () {
    addEventHandlerForSearch();
    loadSavedRunkeeperTweets().then(parseTweets);
});
