import { escapeHtml } from '../format.js'
export function renderAnnouncement(text: string): string { return text ? `<div class="announcement">${escapeHtml(text)}</div>` : '' }
