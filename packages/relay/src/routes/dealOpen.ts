import { Express } from 'express'
import { DB } from 'anondb/node'
import { Synchronizer } from '@unirep/core'

export default (app: Express, db: DB, synchronizer: Synchronizer) => {
  app.post('/api/dealOpen', async (req, res) => {
    try {
      const { id, offerAmount, responderId} = req.body
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
      res.json({ message: 'success!' })
    } catch (error: any) {
      res.status(500).json({ error })
    }
  })
}