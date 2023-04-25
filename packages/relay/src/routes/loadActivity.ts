import { Express } from 'express'
import { DB } from 'anondb/node'
import { Synchronizer } from '@unirep/core'

export default (app: Express, db: DB, synchronizer: Synchronizer) => {
  app.post('/api/loadActivity', async (req, res) => {
    try {
      const { epk0, epk1, epk2 } = req.body
      const listings = await db.findMany('Listings', {
        where: {
          posterId: epk0 || epk1 || epk2,
        },
      })
      const offers = await db.findMany('Offers', {
        where: {
          responderId: epk0 || epk1 || epk2,
        },
      })
      res.json({listings, offers})
    } catch (error: any) {
      res.status(500).json({ error })
    }
  })
}