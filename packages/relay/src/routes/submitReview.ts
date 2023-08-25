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
    app.post('/api/SubmitReview', async (req, res) => {
        try {
            const { id, member, review } = req.body
            if (member === 'poster') {
                await db.update('Listings', {
                    where: {
                        _id: id,
                    },
                    update: {
                        posterReview: review,
                    },
                })
            } else {
                await db.update('Listings', {
                    where: {
                        _id: id,
                    },
                    update: {
                        responderReview: review,
                    },
                })
            }
            res.json({ message: 'review submitted!' })
        } catch (error: any) {
            res.status(500).json({ message: error })
        }
    })
}
