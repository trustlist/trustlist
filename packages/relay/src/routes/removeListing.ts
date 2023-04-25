import { Express } from 'express'
import { DB } from 'anondb/node'
import { Synchronizer } from '@unirep/core'

export default (app: Express, db: DB, synchronizer: Synchronizer) => {
  app.get('/api/removeListing/:id', async (req, res) => {
    try {
      const { id } = req.params
      const listing = await db.delete('Listings', {
        where: {
          _id: id,
        },
      })
      // console.log(deal)
      res.json(listing)
    } catch (error: any) {
      res.status(500).json({ error })
    }
  })
}