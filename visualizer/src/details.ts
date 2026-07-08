import { esc } from './dot'
import type { GroomNode } from './types'

// Details-panel HTML for a clicked node. Pure string builders (easy to test); every piece of
// user-authored content goes through esc() before touching innerHTML.

const list = (title: string, items?: string[]): string => {
  if (!items?.length) return ''
  return `<h4>${esc(title)}</h4><ul>${items.map((it) => `<li>${esc(it)}</li>`).join('')}</ul>`
}

const para = (label: string, text?: string | null): string =>
  text ? `<p><em>${esc(label)}:</em> ${esc(text)}</p>` : ''

export function detailsHtml(node: GroomNode): string {
  switch (node.kind) {
    case 'epic':
      return `<h2>${esc(node.id)} · Epic</h2><h3>${esc(node.title)}</h3>${
        node.description ? `<p>${esc(node.description)}</p>` : ''
      }${para('Business value', node.businessValue)}${para('Design', node.design)}`
    case 'story':
      return `<h2>${esc(node.id)} · Story</h2><h3>${esc(node.title)}</h3>${
        node.description ? `<p>${esc(node.description)}</p>` : ''
      }${list('Acceptance Criteria', node.acceptanceCriteria)}${list('Test Cases', node.testCases)}${list('Links', node.links)}`
    case 'task': {
      const badges = `${node.discipline ? ` <span class="badge">${esc(node.discipline)}</span>` : ''}${
        typeof node.estimate === 'number' ? ` <span class="badge est">${node.estimate}</span>` : ''
      }`
      return `<h2>${esc(node.id)} · Task${badges}</h2><h3>${esc(node.title)}</h3>${list(
        'Implementation',
        node.implementation,
      )}${list('Done when', node.doneWhen)}`
    }
    case 'bug':
      return `<h2>${esc(node.id)} · Bug</h2><h3>${esc(node.title)}</h3>${para('Repro', node.repro)}${para(
        'Expected',
        node.expected,
      )}${para('Actual', node.actual)}`
    default: {
      // The JSON is cast, not validated — an unknown kind still gets a minimal, safe card.
      const n = node as { id: string; title?: string }
      return `<h2>${esc(n.id)}</h2>${n.title ? `<h3>${esc(n.title)}</h3>` : ''}`
    }
  }
}
