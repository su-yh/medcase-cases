export function previewAttachment(attachment, openWindow = window.open) {
  const url = attachment?.url
  if (!url) {
    return
  }

  openWindow(url, '_blank', 'noopener,noreferrer')
}
