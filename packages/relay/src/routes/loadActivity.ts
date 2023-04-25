import { Express } from 'express'
import { DB } from 'anondb/node'
import { Synchronizer } from '@unirep/core'

export default (app: Express, db: DB, synchronizer: Synchronizer) => {
  app.post('/api/loadActivity', async (req, res) => {
    try {
      const { epk0, epk1, epk2 } = req.body
      const listings = await db.findMany('for sale', {
        where: {
          posterId: epk0 || epk1 || epk2,
        },
      })
      const offers = await db.findMany('for sale', {
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