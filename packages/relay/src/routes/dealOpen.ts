import { Express } from 'express'
import { Prover } from '@unirep/circuits'
import { DB } from 'anondb/node'
import { Synchronizer } from '@unirep/core'

export default (
    app: Express,
    prover: Prover,
    db: DB,
    synchronizer: Synchronizer
) => {
    app.post('/api/dealOpen', async (req, res) => {
        try {
            const { id, offerAmount, responderId } = req.body
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
            res.json({ message: 'offer accepted! redirecting to your DEAL.' })
        } catch (error: any) {
            res.status(500).json({ message: error })
        }
    })
}
