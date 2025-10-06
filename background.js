// background.js
chrome.commands.onCommand.addListener((command) => {
  if (command === "extract-content") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "extractContent" });
    });
  }
});


chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: extractArticleContent
  });
});

function extractArticleContent() {
  // Chức năng này sẽ được định nghĩa trong content.js
  // Nhưng cần để ở đây để xử lý sự kiện click
}
