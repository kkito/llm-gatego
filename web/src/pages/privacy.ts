export interface Privacy { enabled: boolean; stripUserField: boolean; sanitizeFilePaths: boolean; pathPlaceholder: string; whitelistFilter: boolean }
export function renderPrivacy(p: Privacy): string {
  return `<form id="privacy-form">${(['enabled','stripUserField','sanitizeFilePaths','whitelistFilter'] as const).map(k => `<label><input type="checkbox" name="${k}"${p[k]?' checked':''}> ${k}</label>`).join('')}<label>Placeholder <input name="pathPlaceholder" value="${p.pathPlaceholder||'USER'}"></label><button type="submit">Save</button></form>`
}
