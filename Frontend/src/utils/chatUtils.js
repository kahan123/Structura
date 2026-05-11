/**
 * Formats a date object or string into a human-readable label.
 * @param {Date|string} dateInput - The date to format.
 * @returns {string} - "Today", "Yesterday", or "MMM DD, YYYY".
 */
export const formatMessageDate = (dateInput) => {
    const date = new Date(dateInput);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === now.toDateString()) {
        return 'Today';
    }

    if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    }

    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

/**
 * Groups an array of messages by their date using formatMessageDate.
 * Assumes messages are already sorted by time.
 * @param {Array} messages - Array of message objects.
 * @returns {Array} - Array of groups: [{ date: string, messages: Array }]
 */
export const groupMessagesByDate = (messages) => {
    if (!messages || messages.length === 0) return [];

    const groups = [];
    let currentGroup = null;

    messages.forEach((msg) => {
        // Handle different date properties depending on source (mock vs real)
        const dateVal = msg.createdAt || msg.timestamp || msg.time;
        // Note: For mock 'time' string like "10:30 AM", this might default to Today/Invalid 
        // if not a full date. We'll handle this in the components or ensure data has full dates.
        // If it's just a time string and we want to group, we might need more logic or better data.
        // Assuming realistic usage involves ISO strings or Date objects for grouping logic.

        // Fallback for simple time strings if no date provided (defaults to Today for safety in mocks if needed)
        // But optimally, we should update mocks to have full dates.
        const dateKey = formatMessageDate(dateVal);

        if (!currentGroup || currentGroup.date !== dateKey) {
            currentGroup = {
                date: dateKey,
                messages: []
            };
            groups.push(currentGroup);
        }
        currentGroup.messages.push(msg);
    });

    return groups;
};
