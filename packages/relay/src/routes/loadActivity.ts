import { Express } from 'express'
import { DB } from 'anondb/node'
import { Synchronizer } from '@unirep/core'

export default (app: Express, db: DB, synchronizer: Synchronizer) => {
  app.post('/api/loadActivity', async (req, res) => {
    try {
      const { epk1, epk2, epk3 } = req.body
      const listings = await db.findMany('for sale', {
        where: {
          posterId: epk1 || epk2 || epk3,
        },
      })
      const offers = await db.findMany('for sale', {
        where: {
          responderId: epk1 || epk2 || epk3,
        },
      })
      res.json({listings, offers})
    } catch (error: any) {
      res.status(500).json({ error })
    }
  })
}