import { useState, useMemo } from 'react'
import WisdomMap from './components/WisdomMap'
import QuoteStream from './components/QuoteStream'
import boardData from './board_data.json'
import topicCoords from './topic_coords.json'
import { motion } from 'framer-motion'
import { Compass } from 'lucide-react'

// Pre-process: Flatten quotes into a master list with coordinates
const allQuotes = []
const presentTopics = new Set()
boardData.forEach(author => {
  author.quotes.forEach(q => {
    const topic = q.topic || "Uncategorized"
    // Normalize logic if needed ("Taking action" vs "Taking Action")
    // For now assume Title Case from normalization step.
    presentTopics.add(topic)

    // Find coords
    const coords = topicCoords[topic]
    if (coords) {
      allQuotes.push({
        ...q,
        authorName: author.name,
        authorStatus: author.status,
        x: coords.x,
        y: coords.y
      })
    }
  })
})

// Filter coords to only what's actually in our data
const filteredTopicCoords = {}
presentTopics.forEach(t => {
  if (topicCoords[t]) {
    filteredTopicCoords[t] = topicCoords[t]
  }
})

function App() {
  const [selectedPoint, setSelectedPoint] = useState(null)
  const [activeQuotes, setActiveQuotes] = useState([])
  const [selectedAuthor, setSelectedAuthor] = useState("")
  const [highlightedTopics, setHighlightedTopics] = useState([])

  const authors = useMemo(() => {
    return boardData.map(a => a.name).sort()
  }, [])

  const handleSelectPoint = (point) => {
    setSelectedAuthor("") // Reset author if clicking map
    setSelectedPoint(point)

    const sorted = allQuotes.map(q => {
      const dist = Math.sqrt(Math.pow(q.x - point.x, 2) + Math.pow(q.y - point.y, 2))
      return { ...q, dist }
    }).sort((a, b) => a.dist - b.dist)

    setActiveQuotes(sorted.slice(0, 20))
    // We'll let the Map component figure out the single nearest topic for the puck feedback
    setHighlightedTopics([])
  }

  const handleAuthorChange = (e) => {
    const authorName = e.target.value
    setSelectedAuthor(authorName)
    setSelectedPoint(null) // Reset point if selecting author

    if (!authorName) {
      setActiveQuotes([])
      setHighlightedTopics([])
      return
    }

    const authorQuotes = allQuotes.filter(q => q.authorName === authorName)
    setActiveQuotes(authorQuotes)

    const topics = [...new Set(authorQuotes.map(q => q.topic))]
    setHighlightedTopics(topics)
  }

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: 0 }}>
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        height: '70px',
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'rgba(15, 16, 20, 0.95)',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Compass size={28} color="var(--gold)" />
          <h1 style={{ fontSize: '1.4rem', fontWeight: '300', margin: 0, color: 'var(--gold)', letterSpacing: 1 }}>
            WISDOM COMPASS
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#888', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 1 }}>Consult:</span>
          <select
            value={selectedAuthor}
            onChange={handleAuthorChange}
            style={{
              backgroundColor: '#1a1b1e',
              color: 'var(--gold)',
              border: '1px solid #333',
              borderRadius: '4px',
              padding: '6px 12px',
              fontSize: '0.9rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">Choose an Author...</option>
            {authors.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left: The Map (Fixed) */}
        <div style={{ flex: 0.65, position: 'relative', borderRight: '1px solid var(--border)' }}>
          <WisdomMap
            topics={filteredTopicCoords}
            onSelect={handleSelectPoint}
            selectedPoint={selectedPoint}
            highlightedTopics={highlightedTopics}
          />
        </div>

        {/* Right: The Stream (Scrollable) */}
        <div style={{ flex: 0.4, backgroundColor: 'var(--bg-card)' }}>
          <QuoteStream quotes={activeQuotes} />
        </div>
      </div>
    </div>
  )
}

export default App
