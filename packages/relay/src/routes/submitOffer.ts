import { Express } from 'express'
import { DB } from 'anondb/node'
import { Synchronizer } from '@unirep/core'

export default (app: Express, db: DB, synchronizer: Synchronizer) => {
  app.post('/api/submitOffer', async (req, res) => {
    try {
      const { epoch, listingId, listingTitle, offerAmount, responderId, rScore1, rScore2, rScore3, rScore4 } = req.body
      await db.create('Offers', {
        epoch,
        listingId,
        listingTitle,
        offerAmount,
        responderId,
        rScore1,
        rScore2,
        rScore3,
        rScore4,
      })
      res.json({ message: 'success!' })
    } catch (error: any) {
      res.status(500).json({ error })
    }
  })
}