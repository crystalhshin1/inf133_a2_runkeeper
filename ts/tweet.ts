class Tweet {
    private text: string;
    time: Date;

    constructor(tweet_text: string, tweet_time: string) {
        this.text = tweet_text;
        this.time = new Date(tweet_time);
    }

    get source(): string {
        const text = this.text.toLowerCase();
        if (text.startsWith('watch my ') && text.includes('runkeeper live')) return 'live_event';
        if (text.startsWith('achieved ') || text.includes('personal record with #runkeeper')) return 'achievement';
        if (text.startsWith('just completed ') || text.startsWith('just posted ')) return 'completed_event';
        return 'miscellaneous';
    }

    get writtenText(): string {
        if (this.source !== 'completed_event') return '';
        const base = this.text.replace(/https?:\/\/\S+/gi, '')
            .replace(/#runkeeper\b/gi, '').trim();
        const dash = base.indexOf(' - ');
        if (dash < 0) return '';
        const annotation = base.slice(dash + 3).trim();
        if (!annotation || annotation.toLowerCase() === 'tomtom mysports watch') return '';
        return annotation;
    }

    get written(): boolean {
        return this.writtenText.length > 0;
    }

    get activityType(): string {
        if (this.source !== 'completed_event') return 'unknown';
        const text = this.text;
        // Distance-based tweet, e.g. "Just completed a 5.00 km run".
        let match = text.match(/^Just (?:completed|posted) an? [\d.]+ (?:mi|km) (.+?)(?= (?:with |-|https?:|#Runkeeper)|$)/i);
        if (match) return match[1].trim().toLowerCase();
        // Duration-based tweet, e.g. "Just posted a yoga practice in 45:00".
        match = text.match(/^Just (?:completed|posted) an? (.+?) in \d+(?::\d+)+(?:\s|$)/i);
        if (match) return match[1].trim().toLowerCase();
        return 'unknown';
    }

    get distance(): number {
        if (this.source !== 'completed_event') return 0;
        const match = this.text.match(/^Just (?:completed|posted) an? ([\d.]+) (mi|km) /i);
        if (!match) return 0;
        const value = Number(match[1]);
        return match[2].toLowerCase() === 'km' ? value / 1.609 : value;
    }

    getHTMLTableRow(rowNumber: number): string {
        // escape the text before adding it to html, then linkify any activity urls
        const escaped = this.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        const linked = escaped.replace(/https?:\/\/[^\s]+/g, (url) =>
            `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
        const activity = this.activityType.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return `<tr><td>${rowNumber}</td><td>${activity}</td><td>${linked}</td></tr>`;
    }
}
