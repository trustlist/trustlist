import { Express } from 'express'
import { DB } from 'anondb/node'
import { Synchronizer } from '@unirep/core'

export default (app: Express, db: DB, synchronizer: Synchronizer) => {
  app.post('/api/submitOffer', async (req, res) => {
    try {
      const { listingId, section, responderId, offerAmount, score1, score2, score3, score4 } = req.body
      await db.update(`${section}`, {
        where: {
          _id: listingId,
        },
        update: {
          responderId,
          offerAmount,
          rScore1: score1,
          rScore2: score2,
          rScore3: score3,
          rScore4: score4,
        },
      })
      res.json({ message: 'success!' })
    } catch (error: any) {
      res.status(500).json({ error })
    }
  })
}