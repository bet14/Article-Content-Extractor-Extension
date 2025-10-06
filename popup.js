// popup.js
document.addEventListener('DOMContentLoaded', function() {
  const extractBtn = document.getElementById('extractBtn');
  const statusDiv = document.getElementById('status');
  
  extractBtn.addEventListener('click', function() {
    // Lấy tab hiện tại
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const activeTab = tabs[0];
      
      // Kiểm tra URL có phải từ các trang tin tức
      const url = activeTab.url;
      const isNewsSite = /bloomberg\.com|ft\.com|reuters\.com|wsj\.com|nytimes\.com/.test(url);
      
      if (isNewsSite) {
        // Gửi message đến content script
chrome.tabs.sendMessage(activeTab.id, {action: "extractContent"}, function(response) {
  if (chrome.runtime.lastError) {
    showStatus('Không thể trích xuất nội dung. Hãy làm mới trang và thử lại.', 'error');
  } else if (response && response.title) {
    showStatus(`Đã sao chép: "${response.title.substring(0, 30)}${response.title.length > 30 ? '...' : ''}"`, 'success');
  } else {
    showStatus('Không tìm thấy nội dung bài báo trên trang này.', 'error');
  }
});
      } else {
        showStatus('Trang web hiện tại không được hỗ trợ.', 'error');
      }
    });
  });
  





  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';
    
    // Tự động ẩn thông báo sau 3 giây
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 3000);
  }
});
