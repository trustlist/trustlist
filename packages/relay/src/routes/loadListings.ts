import { Express } from 'express'
import { DB } from 'anondb/node'
import { Synchronizer } from '@unirep/core'

export default (app: Express, db: DB, synchronizer: Synchronizer) => {
  app.get('/api/loadListings/:section/:category', async (req, res) => {
    try {
      const { section, category } = req.params
      console.log(section, category)
      const listings = await db.findMany(`${section}`, {
        where: {
          category: category,
        },
      })
      console.log(listings)
      res.json(listings)
    } catch (error: any) {
      res.status(500).json({ error })
    }
  })
}