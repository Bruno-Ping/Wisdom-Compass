import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, ChevronLeft, User, Quote, Sparkles } from 'lucide-react'

// Keyword extraction helper (Very basic)
const extractKeywords = (text) => {
    if (!text) return []
    const stopwords = ['the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'to', 'of', 'for', 'it', 'I', 'my', 'how', 'do', 'what', 'help', 'me', 'with']
    return text.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 2 && !stopwords.includes(w))
}

export default function BoardRoom({ members, onLeave }) {
    const [input, setInput] = useState('')
    const [history, setHistory] = useState([]) // Array of {role: 'user'|'board', content: text, author?: obj}
    const [isTyping, setIsTyping] = useState(false)
    const chatEndRef = useRef(null)

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [history, isTyping])

    const handleAsk = () => {
        if (!input.trim()) return

        const question = input.trim()

        // Add User Question
        setHistory(prev => [...prev, { role: 'user', content: question }])
        setInput('')
        setIsTyping(true)

        // Simulate "Thinking" delay
        setTimeout(() => {
            const keywords = extractKeywords(question)
            const responses = []

            // 1. Search for relevant quotes from EACH member
            members.forEach(member => {
                // Score quotes based on keyword matches
                const scoredQuotes = member.quotes.map(q => {
                    let score = 0
                    const qText = q.text.toLowerCase()
                    const qTopic = (q.topic || '').toLowerCase()

                    keywords.forEach(kw => {
                        if (qText.includes(kw)) score += 2
                        if (qTopic.includes(kw)) score += 3 // Topic match is strong
                    })
                    return { ...q, score }
                })

                // Filter for matches
                const matches = scoredQuotes.filter(q => q.score > 0).sort((a, b) => b.score - a.score)

                // Pick top 1 (or 2 if very relevant?)
                if (matches.length > 0) {
                    responses.push({
                        author: member,
                        quote: matches[0]
                    })
                }
            })

            setIsTyping(false)

            if (responses.length === 0) {
                // Fallback?
                setHistory(prev => [...prev, { role: 'system', content: "The board remains silent. No direct advice found for this specific query." }])
            } else {
                // Add responses to history
                const newMessages = responses.map(r => ({
                    role: 'board',
                    author: r.author,
                    content: r.quote.text,
                    topic: r.quote.topic
                }))
                setHistory(prev => [...prev, ...newMessages])
            }

        }, 1500)
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleAsk()
        }
    }

    return (
        <div style={{
            maxWidth: '900px',
            margin: '0 auto',
            height: '85vh',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <button onClick={onLeave} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ChevronLeft size={20} /> Leave
                </button>
                <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Boardroom</h2>
                <div style={{ display: 'flex', gap: '-8px', marginLeft: 'auto' }}>
                    {members.map((m, i) => (
                        <div key={m.id} title={m.name} style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: 'var(--bg-accent)', border: '2px solid var(--bg-dark)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.7rem', marginLeft: i > 0 ? '-10px' : 0
                        }}>
                            {m.name.charAt(0)}
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div style={{
                flex: 1,
                backgroundColor: 'var(--bg-card)',
                borderRadius: '16px',
                border: '1px solid var(--border)',
                padding: '2rem',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem'
            }}>
                {history.length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: 'auto', marginBottom: 'auto' }}>
                        <Sparkles size={48} style={{ color: 'var(--gold)', opacity: 0.5, marginBottom: '1rem' }} />
                        <h3>The Board is convened.</h3>
                        <p>Ask for advice on {members.map(m => m.topics[0]).slice(0, 3).join(", ")}...</p>
                    </div>
                )}

                {history.map((msg, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: '80%',
                            display: 'flex',
                            gap: '1rem',
                            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' // Avatar on right for user (if we had one) or left for board
                        }}
                    >
                        {msg.role === 'board' && (
                            <div style={{
                                minWidth: '40px', height: '40px', borderRadius: '50%',
                                background: 'var(--bg-accent)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--gold)'
                            }}>
                                <User size={20} />
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {msg.role === 'board' && (
                                <span style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 600 }}>
                                    {msg.author.name} <span style={{ color: '#555', fontWeight: 400 }}>• {msg.topic}</span>
                                </span>
                            )}

                            <div style={{
                                backgroundColor: msg.role === 'user' ? 'var(--gold-dim)' : '#25262b',
                                color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
                                padding: '1rem 1.5rem',
                                borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '4px 20px 20px 20px',
                                lineHeight: 1.6,
                                fontSize: '1.05rem',
                                position: 'relative'
                            }}>
                                {msg.role === 'board' && <Quote size={16} style={{ position: 'absolute', top: -8, left: -8, color: '#444', fill: '#444' }} />}
                                {msg.content}
                            </div>
                        </div>
                    </motion.div>
                ))}

                {isTyping && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ width: '40px' }} />
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>The Board is deliberating...</span>
                    </motion.div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ position: 'relative' }}>
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="What is your dilemma?"
                    style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-accent)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        padding: '1.2rem',
                        paddingRight: '60px',
                        fontSize: '1.1rem',
                        color: 'white',
                        outline: 'none',
                        boxSizing: 'border-box' // Important fix
                    }}
                />
                <button
                    onClick={handleAsk}
                    style={{
                        position: 'absolute',
                        right: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'var(--gold)',
                        border: 'none',
                        borderRadius: '8px',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#000'
                    }}
                >
                    <Send size={20} />
                </button>
            </div>
        </div>
    )
}
