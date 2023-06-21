import { Express } from 'express'
import { DB } from 'anondb/node'
import { Synchronizer } from '@unirep/core'

export default (app: Express, db: DB, synchronizer: Synchronizer) => {
  app.post('/api/loadListings', async (req, res) => {
    try {
      const { section, category } = req.body
      const listings = await db.findMany('Listings', {
        where: {
          section,
          category,
        },
      })
      console.log(listings)
      res.json(listings)
    } catch (error: any) {
      res.status(500).json({ error })
    }
  })
}