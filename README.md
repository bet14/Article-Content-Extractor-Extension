

# Article Content Extractor

## Overview
The **Article Content Extractor** is a JavaScript-based browser extension designed to extract article titles and content from web pages, particularly news websites. It provides a robust mechanism to identify and retrieve the main article content and title from a variety of websites, including those with complex DOM structures. The extracted content is copied to the clipboard in a formatted string, suitable for summarization or further processing, and a notification is displayed to confirm the action. The extension supports both manual activation via a floating button and a keyboard shortcut (Ctrl+Q), as well as integration with Chrome's runtime messaging system for programmatic extraction.

This tool is particularly useful for users who need to quickly extract clean, readable article text from websites for tasks such as summarization, content analysis, or archiving. It is designed to handle a range of website layouts, including popular news outlets like Bloomberg, Financial Times, Reuters, The Wall Street Journal, and The New York Times, while also providing a fallback mechanism for generic websites.

## Features
- **Content Extraction**: Extracts the main article title and body text from a webpage, ignoring irrelevant sections like advertisements, related articles, or footers.
- **Site-Specific Support**: Includes tailored selectors for popular news websites (e.g., Bloomberg, Financial Times, Reuters, WSJ, NYT) to ensure accurate content extraction.
- **Fallback Mechanism**: Uses a generic extraction method with the Readability library for websites not explicitly supported.
- **Clipboard Integration**: Copies the extracted content to the clipboard in a formatted string, ready for summarization or further use.
- **User Interaction**: Provides a floating button and a keyboard shortcut (Ctrl+Q) for easy content extraction.
- **Notification System**: Displays a non-intrusive notification confirming the extracted article title.
- **Chrome Extension Integration**: Supports Chrome runtime messaging for programmatic extraction.
- **Customizable Styling**: The floating button and notification use modern, semi-transparent styling for a seamless user experience.

## Installation
To use the Article Content Extractor, follow these steps:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/article-content-extractor.git
   ```
2. **Load the Extension in Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`.
   - Enable "Developer mode" in the top-right corner.
   - Click "Load unpacked" and select the directory containing the cloned repository.
3. **Permissions**:
   - The extension requires permissions for `clipboardWrite` to copy content and `activeTab` to access the current webpage's DOM.
   - Optionally, include `runtime` permissions for messaging support if integrating with other Chrome extensions.

## Usage
Once installed, the extension is ready to use on any supported webpage:

1. **Floating Button**:
   - A floating button with a clipboard icon (📋) appears at the top-center of the webpage.
   - Click the button to extract the article's title and content. The content is copied to the clipboard, and a notification confirms the action.
2. **Keyboard Shortcut**:
   - Press `Ctrl+Q` to trigger the extraction process. The behavior is identical to clicking the floating button.
3. **Chrome Runtime Messaging**:
   - Send a message with the action `extractContent` to the extension via Chrome's runtime API to programmatically extract content. The extension responds with an object containing the `title`, `content`, and `fullContent`.

Example runtime messaging code:
```javascript
chrome.runtime.sendMessage({ action: 'extractContent' }, (response) => {
  console.log(response.title, response.content);
});
```

## How It Works
The extension uses two primary methods for content extraction:

1. **Site-Specific Extraction**:
   - The `extractArticleContent` function checks the website's hostname to apply tailored DOM selectors for popular news sites (e.g., `bloomberg.com`, `ft.com`, `reuters.com`, `wsj.com`, `nytimes.com`).
   - It identifies the article title using `h1` tags or meta tags (e.g., `og:title`, `twitter:title`) and extracts content from specific containers like `article`, `main`, or site-specific classes (e.g., `.body-copy-v2__82c967ef` for Bloomberg).
   - A filtering mechanism (`filterValidContentElements`) excludes irrelevant elements (e.g., related articles, promos) by checking for specific classes.

2. **Generic Extraction with Readability**:
   - If site-specific extraction fails or the content is insufficient (less than 100 characters), the extension falls back to the Readability library.
   - The `Readability` class parses the document to identify the main article content and title, using a combination of meta tags, headings, and content containers with a high density of paragraphs.
   - The Readability library processes a cloned document to avoid modifying the original DOM and handles edge cases like malformed HTML.

3. **Output Formatting**:
   - The extracted title and content are combined into a formatted string prefixed with a Vietnamese instruction for summarization: `Tóm tắt nội dung sau bằng tiếng Việt...`.
   - This string is copied to the clipboard using a dynamically created `textarea` element.
   - A notification with a semi-transparent pink background appears for 3 seconds, displaying the truncated article title.

4. **Floating Button and Notification**:
   - The `createFloatingButton` function adds a styled button to the webpage, positioned at the top-center with a subtle shadow and semi-transparent background.
   - The `showNotification` function creates a temporary notification with similar styling, fading out after 3 seconds.

## Supported Websites
The extension is optimized for the following news websites:
- **Bloomberg** (`bloomberg.com`): Uses selectors like `.body-copy-v2__82c967ef` and `.content-well`.
- **Financial Times** (`ft.com`): Targets `.article__content-body` and `.o-topper__headline`.
- **Reuters** (`reuters.com`): Extracts from `[data-testid="primary-content"]` and `h1[data-testid="heading"]`.
- **The Wall Street Journal** (`wsj.com`): Uses `.article-content` and `.wsj-article-headline`.
- **The New York Times** (`nytimes.com`): Targets `article[data-testid="block-container"]` and `section[name="articleBody"]`.

For unsupported websites, the `findMainArticleContainer` function identifies the most likely content container based on paragraph density and the presence of headings.

## Limitations
- **Dynamic Content**: Websites that load content dynamically (e.g., via JavaScript after initial page load) may require additional handling.
- **Paywalls**: Content behind paywalls may be inaccessible unless the user is logged in.
- **Complex Layouts**: Some websites with non-standard layouts may not be correctly parsed by the generic extraction method.
- **Language**: The summarization instruction is hardcoded in Vietnamese, which may need localization for broader use.
- **Readability Dependency**: The fallback mechanism relies on the Readability library, which may not handle all edge cases perfectly.

## Development
To contribute to the project or customize the extension:

1. **Modify Selectors**:
   - Update the `extractArticleContent` function to add support for additional websites by including new hostname checks and DOM selectors.
2. **Enhance Styling**:
   - Adjust the CSS in `createFloatingButton` and `showNotification` to change the appearance of the UI elements.
3. **Extend Functionality**:
   - Add support for other languages by modifying the summarization instruction in the `fullContent` string.
   - Implement additional triggers (e.g., context menu integration) for extraction.

## Dependencies
- **Readability Library**: Included in the code as a self-contained module for parsing web content.
- No external dependencies are required for the core functionality, making the extension lightweight and portable.

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.

## Contributing
Contributions are welcome! Please submit pull requests or open issues on the GitHub repository for bug reports, feature requests, or improvements.

