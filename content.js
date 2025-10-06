(function() {
  function Readability(doc) {
    this._doc = doc;
    this._articleTitle = null;
    this._articleContent = null;
  }

  Readability.prototype.parse = function() {
    let title = '';
    const metaTitleTags = [
      this._doc.querySelector('meta[property="og:title"]'),
      this._doc.querySelector('meta[name="twitter:title"]'),
      this._doc.querySelector('meta[name="title"]')
    ];
    
    for (const tag of metaTitleTags) {
      if (tag && tag.content) {
        title = tag.content.trim();
        break;
      }
    }

    if (!title) {
      const titleElements = ['h1', 'h2'];
      for (const tag of titleElements) {
        const elements = this._doc.getElementsByTagName(tag);
        if (elements.length > 0) {
          const mainContent = this._doc.querySelector('article, main, .content, .article');
          if (mainContent) {
            const mainHeading = mainContent.querySelector(tag);
            if (mainHeading) {
              title = mainHeading.textContent.trim();
              break;
            }
          }
          title = elements[0].textContent.trim();
          break;
        }
      }
    }

    let mainContent = null;
    const articleSelectors = [
      'article', 
      'main article', 
      '[itemprop="articleBody"]', 
      '.article-content', 
      '.article-body',
      '.story-body'
    ];

    for (const selector of articleSelectors) {
      const element = this._doc.querySelector(selector);
      if (element && element.getElementsByTagName('p').length >= 3) {
        mainContent = element;
        break;
      }
    }

    if (!mainContent) {
      const containers = this._doc.querySelectorAll('article, main, .content, .post, .entry');
      let maxParagraphs = 0;
      for (let i = 0; i < containers.length; i++) {
        const paragraphs = containers[i].getElementsByTagName('p');
        if (paragraphs.length > maxParagraphs) {
          maxParagraphs = paragraphs.length;
          mainContent = containers[i];
        }
      }
    }

    let content = '';
    if (mainContent) {
      const paragraphs = mainContent.querySelectorAll('p:not(.related p):not(.recommendations p):not(.promo p)');
      content = Array.from(paragraphs).map(p => p.textContent.trim()).join('\n\n');
    }

    return {
      title: title,
      content: content,
      textContent: content
    };
  };

  window.Readability = Readability;
})();

function extractArticleContent() {
  let articleTitle = '';
  let articleContent = '';
  const hostname = window.location.hostname;

  function filterValidContentElements(container) {
    const elements = Array.from(container.querySelectorAll('p, h2,div[data-testid^="paragraph-"]'));
    const excludedClasses = ['related', 'more-articles', 'recommendation', 'suggested', 'promo', 'footer'];
    
    return elements.filter(el => {
      return !excludedClasses.some(cls => el.closest(`.${cls}`));
    });
  }
  
  const contentInnerDiv = document.querySelector('div.content-inner');
  if (contentInnerDiv) {
    // Lấy tiêu đề nếu chưa có, ưu tiên h1 trong content-inner
    if (!articleTitle) {
      const titleElement = contentInnerDiv.querySelector('h1');
      if (titleElement) {
        articleTitle = titleElement.textContent.trim();
      }
    }

    // Lấy tất cả các thẻ <p> trong content-inner
    const paragraphs = contentInnerDiv.querySelectorAll('p');
    if (paragraphs.length > 0) {
      articleContent = Array.from(paragraphs).map(p => p.textContent.trim()).join('\n\n');
    }
  }

  if (hostname.includes('bloomberg.com')) {
    const titleElement = document.querySelector('h1.headline__699ae8fb, h1.lede-text-v2__hed');
    if (!titleElement) {
      const mainContent = document.querySelector('main, article, .content-well');
      if (mainContent) {
        const possibleTitle = mainContent.querySelector('h1');
        articleTitle = possibleTitle ? possibleTitle.textContent.trim() : '';
      }
    } else {
      articleTitle = titleElement.textContent.trim();
    }

    const articleSection = document.querySelector('div.body-copy-v2__82c967ef, .body-content, article[data-type="article"]');
    if (articleSection) {
      const contentElements = filterValidContentElements(articleSection);
      articleContent = contentElements.map(el => el.textContent.trim()).join('\n\n');
    }
  } 
  else if (hostname.includes('ft.com')) {
    const titleElement = document.querySelector('h1.o-topper__headline, h1.article__title, h1[data-trackable="heading"]');
    articleTitle = titleElement ? titleElement.textContent.trim() : '';

    const contentContainer = document.querySelector('div.article__content-body, div.n-content-body, .article-body');
    if (contentContainer) {
      const contentElements = filterValidContentElements(contentContainer);
      articleContent = contentElements.map(el => el.textContent.trim()).join('\n\n');
    }
  }
  else if (hostname.includes('reuters.com')) {
  const mainContent = document.querySelector('[data-testid="primary-content"], article');
  if (mainContent) {
    const titleElement = mainContent.querySelector('h1[data-testid="heading"], h1.article-header');
    articleTitle = titleElement ? titleElement.textContent.trim() : '';

    const contentElements = filterValidContentElements(mainContent);
    articleContent = contentElements.map(el => el.textContent.trim()).join('\n\n');
    }
  }



  else if (hostname.includes('wsj.com')) {
    const articleContainer = document.querySelector('article, .article-container');
    if (articleContainer) {
      const titleElement = articleContainer.querySelector('h1, .wsj-article-headline, .article-header');
      articleTitle = titleElement ? titleElement.textContent.trim() : '';

      const contentContainer = articleContainer.querySelector('.article-content, .wsj-snippet-body');
      if (contentContainer) {
        const contentElements = filterValidContentElements(contentContainer);
        articleContent = contentElements.map(el => el.textContent.trim()).join('\n\n');
      }
    }
  }
  else if (hostname.includes('nytimes.com')) {
    const articleContainer = document.querySelector('article[data-testid="block-container"]');
    if (articleContainer) {
      const titleElement = articleContainer.querySelector('h1[data-testid="headline"], h1.e1h9rw200');
      articleTitle = titleElement ? titleElement.textContent.trim() : '';

      const contentContainer = articleContainer.querySelector('section[name="articleBody"], .meteredContent');
      if (contentContainer) {
        const contentElements = filterValidContentElements(contentContainer);
        articleContent = contentElements.map(el => el.textContent.trim()).join('\n\n');
      }
    }
  }
  else {
    const mainContainer = findMainArticleContainer();
    if (mainContainer) {
      const titleElement = mainContainer.querySelector('h1');
      articleTitle = titleElement ? titleElement.textContent.trim() : '';

      const contentElements = filterValidContentElements(mainContainer);
      articleContent = contentElements.map(p => p.textContent.trim()).join('\n\n');
    }
  }

  if (!articleTitle) {
    const possibleTitles = [
      document.querySelector('meta[property="og:title"]'),
      document.querySelector('meta[name="twitter:title"]'),
      document.querySelector('article h1'),
      document.querySelector('main h1'),
      document.querySelector('.article h1'),
      document.querySelector('.post h1'),
      document.querySelector('h1')
    ];
    
    for (const titleCandidate of possibleTitles) {
      if (titleCandidate) {
        articleTitle = titleCandidate.content || titleCandidate.textContent.trim();
        if (articleTitle) break;
      }
    }
  }

  if (!articleContent || articleContent.length < 100) {
    try {
      const documentClone = document.cloneNode(true);
      const reader = new Readability(documentClone);
      const article = reader.parse();

      if (article) {
        if (!articleTitle && article.title) {
          articleTitle = article.title;
        }
        articleContent = article.textContent || article.content;
      }
    } catch (e) {
      console.error('Lỗi khi sử dụng Readability:', e);
    }
  }

  const fullContent = `Tóm tắt nội dung sau bằng tiếng Việt, chỉ trả về phần tóm tắt chi tiết trên 1000 chữ hoặc một nữa nội dung cung cấp, không thêm lời giới thiệu hay nhận xét:
 \n\n${articleTitle}\n\n${articleContent}`;
  copyToClipboard(fullContent);
  showNotification(articleTitle);

  return { title: articleTitle, content: articleContent, fullContent: fullContent };
}

function findMainArticleContainer() {
  const potentialContainers = [
    'article',
    'main article',
    '.article-content',
    '.article-body',
    '.story-body',
    '.entry-content',
    '.post-content',
    '[itemprop="articleBody"]',
    '[data-testid="block-container"]',
    '.content-body'
  ];

  for (const selector of potentialContainers) {
    const container = document.querySelector(selector);
    if (container) {
      const paragraphs = container.querySelectorAll('p');
      const hasHeading = container.querySelector('h1, h2');
      if (paragraphs.length >= 3 && hasHeading) {
        return container;
      }
    }
  }

  const allPotentialContainers = ['article', 'main', '.content', '.post', '.entry', '.story'];
  let bestContainer = null;
  let maxParagraphs = 0;

  for (const selector of allPotentialContainers) {
    const elements = selector.startsWith('.') 
      ? document.getElementsByClassName(selector.substring(1))
      : document.getElementsByTagName(selector);

    for (let i = 0; i < elements.length; i++) {
      const paragraphs = elements[i].querySelectorAll('p');
      if (paragraphs.length > maxParagraphs) {
        maxParagraphs = paragraphs.length;
        bestContainer = elements[i];
      }
    }
  }

  return bestContainer;
}

function copyToClipboard(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    console.log('Sao chép ' + (successful ? 'thành công' : 'thất bại'));
  } catch (err) {
    console.error('Không thể sao chép nội dung: ', err);
  }

  document.body.removeChild(textArea);
}

function showNotification(title) {
  const notification = document.createElement('div');
  notification.textContent = `Copied: "${title.substring(0, 50)}${title.length > 50 ? '...' : ''}"`;
  notification.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(255, 105, 180, 0.3);
    color: #333333; /* màu chữ xám đậm */
    padding: 15px 20px;
    border-radius: 4px;
    z-index: 10000;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    font-family: Arial, sans-serif;
    font-size: 14px;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.5s';
    setTimeout(() => document.body.removeChild(notification), 500);
  }, 3000);
}



document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'q') {
      extractArticleContent();
    }
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractContent') {
    const result = extractArticleContent();
    sendResponse(result);
  }
  return true;
});


function createFloatingButton() {
  const button = document.createElement('button');
  button.textContent = '📋';
  button.style.cssText = `
    position: fixed;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 99999;
    background-color: rgba(255, 105, 180, 0.3);
    color: white;
    border: none;
    border-radius: 5px;
    padding: 10px 20px;
    font-size: 14px;
    cursor: pointer;
    font-family: Arial, sans-serif;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  `;

  button.addEventListener('click', () => {
    extractArticleContent();
  });

  document.body.appendChild(button);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createFloatingButton);
} else {
  createFloatingButton();
}
