import { decisionMatrix } from './matrix.js'
import { handTypes, playerChoices } from './types.js'

// buildDecks:: Number -> Card[]
export const buildDecks = (amount) => {
  const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades']
  const royalCards = ['J', 'Q', 'K', 'A']

  const createSuitedCards = (suit) => {
    return Array.from({ length: amount * 13 }, (_, index) => {
      const valueIndex = index % 13
      return {
        value: valueIndex <= 8 ? 2 + valueIndex : royalCards[valueIndex - 9] === 'A' ? 11 : 10,
        name: valueIndex <= 8 ? (2 + valueIndex).toString() : royalCards[valueIndex - 9],
        suit: suit,
      }
    })
  }
  return suits.flatMap((suit) => createSuitedCards(suit))
}
export const testDeck = Array.from({ length: 50 }, (_) => {
  return {
    value: 10,
    name: 10,
    suit: 'Hearts',
  }
})

export const buildStackedDeck1 = (amount) => {
  const suits = ['Spades']

  const createSuitedCards = (suit) => {
    return Array.from({ length: amount / 2 }, (_, index) => {
      if (index % 2 === 0) {
        // dealers hand
        return [
          { name: '8', value: 8, suit: 'Spades' },
          { name: 10, value: 10, suit: 'Spades' },
        ]
      } else {
        // players hand
        return [
          { name: '3', value: 3, suit: 'Spades' },
          { name: 'J', value: 10, suit: 'Spades' },
        ]
      }
    }).flat()
  }
  return suits.flatMap((suit) => createSuitedCards(suit))
}

// drawCard:: -> Card[] -> [Card, Card[]]
export const drawCard = (deckCards, stackedDeck = false) => {
  if (!stackedDeck) {
    // const randomIndex = Math.floor(Math.random() * deckCards.length)
    const newDeck = [...deckCards.filter((_, index) => index !== 0)]
    return [deckCards[0], newDeck]
  } else {
    const newDeck = [...deckCards.filter((_, index) => index !== 0)]
    return [deckCards[0], newDeck]
  }
}

// handTotal:: -> Card[] -> Number
export const handTotal = (hand) => {
  if (!hand) {
    return 0
  }
  // sort hand and add 'A' last to know if an 'A' is 11 or 1
  const sortedHand = [...hand].sort((a, b) => a.value - b.value)

  return sortedHand.reduce((acc, card) => {
    if (card.name !== 'A') {
      return card.value + acc
    } else if (acc + card.value > 21) {
      return acc + 1
    } else {
      return acc + card.value
    }
  }, 0)
}
const isSoftHand = (hand) => {
  // Check if there's an Ace in the hand
  if (!hand.some((card) => card.name === 'A')) return false

  // Calculate the hand total assuming all Aces are counted as 1
  const totalWithAcesAsOne = handTotal(hand.map((card) => (card.name === 'A' ? { ...card, value: 1 } : card)))

  return totalWithAcesAsOne <= 11
}

// getHandType:: Card[] -> String
export const getHandType = (hand) => {
  if (hand.length === 0) return
  if (hand.length === 2 && hand.every((card) => card.name === 'A')) {
    return handTypes.pairs
  } else if (isSoftHand(hand)) {
    return handTypes.soft
  } else if (hand.every((card) => card.value === hand[0].value)) {
    return handTypes.pairs
  }
  return handTypes.hard
}

// checkBust:: Card[] -> Boolean
export const checkBust = (hand) => {
  return handTotal(hand) > 21
}

// checkStrategy :: String -> Int -> Card[] -> String
export const strategyCheck = (handType, dealerCardTotal, playerHand) => {
  // parse data to follow decisionMatrix structure
  const parsePlayerHand = () => {
    // since pairs have to be / by two and two A's === 12
    if (playerHand.every((card) => card.name === 'A')) {
      return 11
    } else if (handType === handTypes.pairs) {
      return handTotal(playerHand) / 2
    } else {
      return handTotal(playerHand) > 20 ? 20 : handTotal(playerHand)
    }
  }

  // get player options as list
  const playerCardRanges = Object.keys(decisionMatrix[handType][dealerCardTotal])

  // if player options are a single value return choice
  const rangeMatch = playerCardRanges.find((range) => {
    if (range === parsePlayerHand().toString()) {
      return true
    }

    // parse player card range into a integers represented by min and max
    const [min, max] = range.split('-').map(Number)
    return parsePlayerHand() >= min && parsePlayerHand() <= max
  })

  // if a match was found return choice
  if (rangeMatch) {
    const correctChoice = decisionMatrix[handType][dealerCardTotal][rangeMatch]
    if (correctChoice === playerChoices.double && playerHand.length > 2) {
      return playerChoices.hit
    }
    return correctChoice
  }
  // if error
  return `Error handType = ${handType} dealerCard = ${dealerCardTotal} playerHand = ${playerHand}`
}

// console.log(
//   strategyCheck('hard', 10, [
//     { name: 5, value: 5, suite: 'Spade' },
//     { name: 5, value: 5, suite: 'Spade' },
//     { name: 3, value: 3, suite: 'Spade' },
//     { name: 4, value: 4, suite: 'Spade' },
//   ])
// )

// keepCount :: Card[] -> Number
export const getRunningCount = (hand) => {
  if (!hand) return 0
  return hand.reduce((acc, card) => {
    if (card.value >= 10) {
      return acc - 1
    } else if (card.value >= 2 && card.value <= 6) {
      return acc + 1
    } else {
      return acc
    }
  }, 0)
}

// getTrueCount :: Number -> Number -> Number
export const getTrueCount = (runningCount, decksRemaining) => {
  return Math.floor(runningCount / decksRemaining)
}

// shuffleDeck :: Card[] -> Card[]
export const shuffleDeck = (array) => {
  const copyArray = [...array]

  // Shuffle the copy
  const shuffledArray = copyArray.reduce((acc, _, currentIndex) => {
    const randomIndex = Math.floor(Math.random() * (currentIndex + 1))
    acc[currentIndex] = acc[randomIndex]
    acc[randomIndex] = array[currentIndex]
    return acc
  }, [])

  return shuffledArray
}
