export function buildTitle(pageTitle) {
  const appTitle = import.meta.env.VITE_APP_TITLE || 'MedCase 医生端'
  return pageTitle ? `${pageTitle} - ${appTitle}` : appTitle
}
