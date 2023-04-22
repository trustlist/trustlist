import { Express } from 'express'
import { DB } from 'anondb/node'
import { Synchronizer } from '@unirep/core'

export default (app: Express, db: DB, synchronizer: Synchronizer) => {
  app.post('/api/addListing', async (req, res) => {
    try {
      const { epoch, section, category, title, amount, amountType, description, posterId, score1, score2, score3, score4 } = req.body
      await db.create(`${section}`, {
        epoch,
        section,
        category,
        title,
        amount,
        amountType,
        description,
        posterId,
        score1,
        score2,
        score3,
        score4,
        responderId: '',
        offerAmount: '',
        rScore1: '',
        rScore2: '',
        rScore3: '',
        rScore4: '',
        dealOpened: false,
        dealClosed: false,
      })
      res.json({ message: 'success!' })
    } catch (error: any) {
      res.status(500).json({ error })
    }
  })
}