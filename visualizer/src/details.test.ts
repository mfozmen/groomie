import { describe, expect, it } from 'vitest'
import { detailsHtml } from './details'

describe('detailsHtml', () => {
  it('renders an epic with description, business value and design', () => {
    const html = detailsHtml({
      id: 'E1',
      kind: 'epic',
      title: 'The Feature',
      description: 'What it does.',
      businessValue: 'Why it matters.',
      design: 'https://figma.example',
    })
    expect(html).toContain('E1 · Epic')
    expect(html).toContain('What it does.')
    expect(html).toContain('Business value:')
    expect(html).toContain('Design:')
  })

  it('renders a story with AC, test cases and links; omits empty lists', () => {
    const html = detailsHtml({
      id: 'S1',
      kind: 'story',
      epicId: 'E1',
      title: 'As a user…',
      acceptanceCriteria: ['a criterion'],
      testCases: [],
    })
    expect(html).toContain('S1 · Story')
    expect(html).toContain('Acceptance Criteria')
    expect(html).toContain('<li>a criterion</li>')
    expect(html).not.toContain('Test Cases')
    expect(html).not.toContain('Links')
  })

  it('renders a task with discipline + estimate badges and its lists', () => {
    const html = detailsHtml({
      id: 'T1',
      kind: 'task',
      epicId: 'E1',
      title: 'Do it',
      discipline: 'Backend',
      estimate: 5,
      implementation: ['step 1'],
      doneWhen: ['done'],
    })
    expect(html).toContain('T1 · Task')
    expect(html).toContain('<span class="badge">Backend</span>')
    expect(html).toContain('<span class="badge est">5</span>')
    expect(html).toContain('Implementation')
    expect(html).toContain('Done when')
  })

  it('renders a bug with repro/expected/actual', () => {
    const html = detailsHtml({
      id: 'B1',
      kind: 'bug',
      epicId: 'E1',
      title: 'It breaks',
      repro: 'click',
      expected: 'works',
      actual: 'boom',
    })
    expect(html).toContain('B1 · Bug')
    expect(html).toContain('Repro:')
    expect(html).toContain('Expected:')
    expect(html).toContain('Actual:')
  })

  it('escapes user content so it cannot inject markup', () => {
    const html = detailsHtml({
      id: 'T1',
      kind: 'task',
      epicId: 'E1',
      title: '<img src=x onerror=alert(1)>',
      implementation: ['<script>boom()</script>'],
    })
    expect(html).not.toContain('<img')
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;img')
  })

  it('renders a minimal safe card for an unknown kind (cast, unvalidated JSON)', () => {
    const html = detailsHtml({ id: 'Z1', kind: 'chore', title: 'weird' } as never)
    expect(html).toContain('Z1')
    expect(html).toContain('weird')
  })
})
