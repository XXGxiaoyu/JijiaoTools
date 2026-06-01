chrome.runtime.onInstalled.addListener(() => {
  console.log('[jijiao-tools] service worker installed')
})

chrome.runtime.onMessage.addListener((msg, sender) => {
  // popup -> active tab content script
  if (msg?.type === 'START' || msg?.type === 'STOP') {
    chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      if (tab?.id) chrome.tabs.sendMessage(tab.id, msg).catch(() => {})
    })
  }
  // content -> popup (broadcast)
  if (msg?.type === 'STATE_CHANGED' && sender.tab) {
    chrome.runtime.sendMessage(msg).catch(() => {})
  }
  return false
})
