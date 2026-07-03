import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Loader } from './Loader'

const file = (content: string) => new File([content], 'graph.json', { type: 'application/json' })
const fileInput = () => document.querySelector('input[type=file]') as HTMLInputElement

describe('Loader', () => {
  it('renders the drop prompt and a file input', () => {
    render(<Loader onLoad={() => {}} />)
    expect(screen.getByText(/Breakdown Graph/i)).toBeInTheDocument()
    expect(fileInput()).not.toBeNull()
  })

  it('parses a valid graph file and calls onLoad', async () => {
    const onLoad = vi.fn()
    render(<Loader onLoad={onLoad} />)
    fireEvent.change(fileInput(), { target: { files: [file(JSON.stringify({ nodes: [], edges: [] }))] } })
    await waitFor(() => expect(onLoad).toHaveBeenCalledWith({ nodes: [], edges: [] }))
  })

  it('shows an error on invalid JSON', async () => {
    render(<Loader onLoad={() => {}} />)
    fireEvent.change(fileInput(), { target: { files: [file('not json{')] } })
    expect(await screen.findByText(/Could not load/i)).toBeInTheDocument()
  })

  it('shows an error when nodes/edges are not arrays', async () => {
    render(<Loader onLoad={() => {}} />)
    fireEvent.change(fileInput(), { target: { files: [file(JSON.stringify({ nodes: 'x' }))] } })
    expect(await screen.findByText(/not a Groomie graph/i)).toBeInTheDocument()
  })

  it('surfaces an external (layout) error passed in as a prop', () => {
    render(<Loader onLoad={() => {}} error="boom from layout" />)
    expect(screen.getByText('boom from layout')).toBeInTheDocument()
  })

  it('highlights on drag over and clears on drag leave', () => {
    const { container } = render(<Loader onLoad={() => {}} />)
    const zone = container.querySelector('.loader') as HTMLElement
    fireEvent.dragOver(zone)
    expect(container.querySelector('.loader.over')).not.toBeNull()
    fireEvent.dragLeave(zone)
    expect(container.querySelector('.loader.over')).toBeNull()
  })

  it('loads a dropped file', async () => {
    const onLoad = vi.fn()
    const { container } = render(<Loader onLoad={onLoad} />)
    const zone = container.querySelector('.loader') as HTMLElement
    fireEvent.drop(zone, { dataTransfer: { files: [file(JSON.stringify({ nodes: [], edges: [] }))] } })
    await waitFor(() => expect(onLoad).toHaveBeenCalled())
  })
})
