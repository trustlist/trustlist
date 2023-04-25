import { Express } from 'express'
import { DB } from 'anondb/node'
import { Synchronizer } from '@unirep/core'

export default (app: Express, db: DB, synchronizer: Synchronizer) => {
  app.post('/api/updateDeal', async (req, res) => {
    try {
      const { id, offerAmount, responderId, action } = req.body
      if (action === 'open') {
        await db.update('Listings', {
          where: {
            _id: id,
          },
          update: {
            offerAmount,
            responderId,
            dealOpened: true,
          },
        })
      } else {
        await db.update('Listings', {
          where: {
            _id: id,
          },
          update: {
            dealClosed: true,
          },
        })
      }
      res.json({ message: 'success!' })
    } catch (error: any) {
      res.status(500).json({ error })
    }
  })
}