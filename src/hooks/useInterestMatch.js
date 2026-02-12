import { useMemo } from 'react'
import { useDebounce } from './useDebounce'

/**
 * Hook that matches message text against contact interests.
 * Returns contacts whose interests match words in the message,
 * excluding already-selected recipients and dismissed contacts.
 */
export function useInterestMatch(message, contacts, recipients, dismissedIds) {
  const debouncedMessage = useDebounce(message, 400)

  // Pre-build index: interest word (lowercase) -> contacts with that interest
  const interestIndex = useMemo(() => {
    const index = new Map()
    contacts.forEach((contact) => {
      if (!contact.interests) return
      contact.interests.forEach((interest) => {
        const key = interest.toLowerCase().trim()
        if (!key) return
        if (!index.has(key)) index.set(key, [])
        index.get(key).push(contact)
      })
    })
    return index
  }, [contacts])

  // Compute matched contacts from debounced message
  const matchedContacts = useMemo(() => {
    if (!debouncedMessage.trim()) return []

    // Extract unique words (lowercase, strip punctuation, min 3 chars)
    const words = new Set(
      debouncedMessage
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter((w) => w.length >= 3)
    )

    const existingIds = new Set(recipients.map((r) => r.id))
    const matched = new Map()

    words.forEach((word) => {
      const contactsForInterest = interestIndex.get(word)
      if (!contactsForInterest) return
      contactsForInterest.forEach((contact) => {
        if (matched.has(contact.id)) return
        if (existingIds.has(contact.id)) return
        if (dismissedIds.has(contact.id)) return
        matched.set(contact.id, {
          ...contact,
          _autoMatched: true,
          _matchedInterest: word,
        })
      })
    })

    return Array.from(matched.values())
  }, [debouncedMessage, interestIndex, recipients, dismissedIds])

  return { matchedContacts }
}
