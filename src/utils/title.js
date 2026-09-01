export function buildTitle(pageTitle) {
  const appTitle = import.meta.env.VITE_APP_TITLE || 'MedCase 病例端'
  return pageTitle ? `${pageTitle} - ${appTitle}` : appTitle
}
