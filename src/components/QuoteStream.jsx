import { motion, AnimatePresence } from 'framer-motion'
import { Quote, User } from 'lucide-react'

export default function QuoteStream({ quotes }) {
    if (quotes.length === 0) {
        return (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', textAlign: 'center', padding: '2rem' }}>
                <div>
                    <Quote size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                    <p>Select a region on the map<br />to discover wisdom.</p>
                </div>
            </div>
        )
    }

    return (
        <div style={{ height: '100%', overflowY: 'auto', padding: '2rem' }}>
            <h3 style={{ marginTop: 0, marginBottom: '2rem', fontSize: '0.9rem', color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>
                Nearest Wisdom
            </h3>

            <AnimatePresence mode="popLayout">
                {quotes.map((q, i) => (
                    <motion.div
                        key={`${q.authorName}-${i}`} // Ideally unique ID
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: i * 0.05 }}
                        style={{
                            marginBottom: '2rem',
                            paddingBottom: '2rem',
                            borderBottom: '1px solid #222'
                        }}
                    >
                        <div style={{ fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '1rem', color: '#ddd' }}>
                            "{q.text}"
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: 24, height: 24, background: '#333', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#888' }}>
                                    <User size={12} />
                                </div>
                                <span style={{ fontSize: '0.9rem', color: 'var(--gold)', fontWeight: 500 }}>
                                    {q.authorName}
                                </span>
                            </div>

                            <span style={{ fontSize: '0.8rem', color: '#555', border: '1px solid #333', padding: '2px 6px', borderRadius: 4 }}>
                                {q.topic}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}
