import { useEffect, useRef, useState } from 'react'
import { createStompClient, subscribeBlueprint } from './lib/stompClient.js'
import { createSocket } from './lib/socketIoClient.js'

const REST_BASE = import.meta.env.VITE_API_BASE ?? ''
const IO_BASE = import.meta.env.VITE_IO_BASE ?? ''
const STOMP_BASE = import.meta.env.VITE_STOMP_BASE ?? ''

export default function App() {
  const [tech, setTech] = useState('none')
  const [author, setAuthor] = useState('juan')
  const [name, setName] = useState('plano-1')
  const [points, setPoints] = useState([])
  const [blueprints, setBlueprints] = useState([])
  const [authorPoints, setAuthorPoints] = useState(0)
  const [authorBlueprints, setAuthorBlueprints] = useState(0)
  const [error, setError] = useState('')
  const canvasRef = useRef(null)

  const stompRef = useRef(null)
  const unsubRef = useRef(null)
  const socketRef = useRef(null)

  const restBase = REST_BASE

  function drawAll(nextPoints) {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0,0,600,400)
    ctx.beginPath()
    nextPoints.forEach((p,i)=> {
      if (i===0) ctx.moveTo(p.x,p.y); else ctx.lineTo(p.x,p.y)
    })
    ctx.stroke()
  }

  useEffect(() => {
    drawAll(points)
  }, [points])

  async function loadBlueprintsByAuthor() {
    try {
      setError('')
      const response = await fetch(`${restBase}/api/blueprints?author=${encodeURIComponent(author)}`)
      if (!response.ok) {
        setBlueprints([])
        setError('No se pudo cargar la lista de planos')
        return
      }
      const data = await response.json()
      const list = Array.isArray(data) ? data : (Array.isArray(data?.blueprints) ? data.blueprints : [])
      setBlueprints(list)
    } catch (e) {
      setBlueprints([])
      setError(e?.message ?? 'Error de red al cargar la lista de planos')
    }
  }

  async function loadBlueprint(authorValue, nameValue) {
    try {
      setError('')
      const response = await fetch(`${restBase}/api/blueprints/${encodeURIComponent(authorValue)}/${encodeURIComponent(nameValue)}`)
      if (!response.ok) {
        setPoints([])
        setError('No se pudo cargar el plano')
        return
      }
      const bp = await response.json()
      setPoints(Array.isArray(bp.points) ? bp.points : [])
    } catch (e) {
      setPoints([])
      setError(e?.message ?? 'Error de red al cargar el plano')
    }
  }

  async function loadAuthorPoints(authorValue) {
    try {
      const response = await fetch(`${restBase}/api/users/${encodeURIComponent(authorValue)}/points`)
      if (!response.ok) {
        setAuthorPoints(0)
        setAuthorBlueprints(0)
        return
      }
      const stats = await response.json()
      setAuthorPoints(Number(stats?.totalPoints ?? 0))
      setAuthorBlueprints(Number(stats?.totalBlueprints ?? 0))
    } catch {
      setAuthorPoints(0)
      setAuthorBlueprints(0)
    }
  }

  useEffect(() => {
    loadBlueprintsByAuthor()
    loadAuthorPoints(author)
  }, [author, restBase])

  useEffect(() => {
    if (!author || !name) return
    loadBlueprint(author, name)
  }, [author, name, restBase])

  useEffect(() => {
    unsubRef.current?.(); unsubRef.current = null
    stompRef.current?.deactivate?.(); stompRef.current = null
    socketRef.current?.disconnect?.(); socketRef.current = null

    if (tech === 'none') return () => {}

    if (tech === 'stomp') {
      const client = createStompClient(STOMP_BASE)
      stompRef.current = client
      client.onConnect = () => {
        unsubRef.current = subscribeBlueprint(client, author, name, (upd)=> {
          setPoints(Array.isArray(upd.points) ? upd.points : [])
        })
      }
      client.activate()
    } else {
      const s = createSocket(IO_BASE)
      socketRef.current = s
      const room = `blueprints.${author}.${name}`
      s.emit('join-room', room)
      s.emit('join-author-room', author)
      s.on('blueprint-update', (upd)=> setPoints(Array.isArray(upd.points) ? upd.points : []))
      s.on('user-points-update', (upd) => {
        if (upd?.author !== author) return
        setAuthorPoints(Number(upd.totalPoints ?? 0))
        setAuthorBlueprints(Number(upd.totalBlueprints ?? 0))
      })
    }
    return () => {
      unsubRef.current?.(); unsubRef.current = null
      stompRef.current?.deactivate?.()
      socketRef.current?.disconnect?.()
    }
  }, [tech, author, name])

  function onClick(e) {
    const rect = e.target.getBoundingClientRect()
    const point = { x: Math.round(e.clientX - rect.left), y: Math.round(e.clientY - rect.top) }
    setPoints((prev) => [...prev, point])

    if (tech === 'stomp' && stompRef.current?.connected) {
      stompRef.current.publish({ destination: '/app/draw', body: JSON.stringify({ author, name, point }) })
    } else if (tech === 'socketio' && socketRef.current?.connected) {
      const room = `blueprints.${author}.${name}`
      socketRef.current.emit('draw-event', { room, author, name, point })
    }
  }

  async function onCreate() {
    try {
      setError('')
      const response = await fetch(`${restBase}/api/blueprints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, name, points: [] }),
      })
      if (!response.ok) {
        setError('No se pudo crear el plano')
        return
      }
      setPoints([])
      await loadBlueprintsByAuthor()
      await loadAuthorPoints(author)
    } catch (e) {
      setError(e?.message ?? 'Error de red al crear el plano')
    }
  }

  async function onSaveOrUpdate() {
    try {
      setError('')
      const response = await fetch(`${restBase}/api/blueprints/${encodeURIComponent(author)}/${encodeURIComponent(name)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, name, points }),
      })
      if (!response.ok) {
        setError('No se pudo guardar/actualizar el plano')
        return
      }
      await loadBlueprintsByAuthor()
      await loadAuthorPoints(author)
    } catch (e) {
      setError(e?.message ?? 'Error de red al guardar/actualizar')
    }
  }

  async function onDelete() {
    try {
      setError('')
      const response = await fetch(`${restBase}/api/blueprints/${encodeURIComponent(author)}/${encodeURIComponent(name)}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        setError('No se pudo eliminar el plano')
        return
      }
      setPoints([])
      await loadBlueprintsByAuthor()
      await loadAuthorPoints(author)
    } catch (e) {
      setError(e?.message ?? 'Error de red al eliminar el plano')
    }
  }

  return (
    <div style={{fontFamily:'Inter, system-ui', padding:16, maxWidth:900}}>
      <h2>BluePrints RT – Socket.IO vs STOMP</h2>
      <div style={{display:'flex', gap:8, alignItems:'center', marginBottom:8}}>
        <label>Tecnología:</label>
        <select value={tech} onChange={e=>setTech(e.target.value)}>
          <option value="none">None</option>
          <option value="stomp">STOMP (Spring)</option>
          <option value="socketio">Socket.IO (Node)</option>
        </select>
        <input value={author} onChange={e=>setAuthor(e.target.value)} placeholder="autor"/>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="plano"/>
      </div>
      <div style={{display:'flex', gap:8, marginBottom:8}}>
        <button onClick={onCreate}>Create</button>
        <button onClick={onSaveOrUpdate}>Save/Update</button>
        <button onClick={onDelete}>Delete</button>
      </div>
      <div style={{marginBottom:10}}>
        <strong>Panel del autor</strong>
        <table style={{width:'100%', borderCollapse:'collapse', marginTop:6, marginBottom:6}}>
          <thead>
            <tr>
              <th style={{textAlign:'left', borderBottom:'1px solid #ddd'}}>Plano</th>
              <th style={{textAlign:'left', borderBottom:'1px solid #ddd'}}>Puntos</th>
            </tr>
          </thead>
          <tbody>
            {blueprints.map((bp) => {
              const count = Array.isArray(bp.points) ? bp.points.length : Number(bp.numpoints ?? bp.totalPoints ?? 0)
              return (
                <tr
                  key={`${bp.author ?? author}-${bp.name}`}
                  onClick={() => setName(bp.name)}
                  style={{cursor:'pointer', backgroundColor: bp.name === name ? '#f8fbff' : 'transparent'}}
                >
                  <td style={{padding:'4px 0'}}>{bp.name}</td>
                  <td>{count}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div>Total de puntos del autor: {authorPoints}</div>
        <div>Total de planos del autor: {authorBlueprints}</div>
      </div>
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        style={{border:'1px solid #ddd', borderRadius:12}}
        onClick={onClick}
      />
      {error && <p style={{color:'#b00020', marginTop:8}}>{error}</p>}
      <p style={{opacity:.7, marginTop:8}}>Tip: abre 2 pestañas y dibuja alternando para ver la colaboración.</p>
    </div>
  )
}
