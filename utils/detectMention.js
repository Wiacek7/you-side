export function detectMention(text) {
    const mentionRegex = /@buildoor_bot\s+(.*)/i;
    const match = text.match(mentionRegex);
  
    if (match) {
      return match[1].trim(); // Extract the question after @botter_bot
    }
    return null; // No mention detected
  }
  