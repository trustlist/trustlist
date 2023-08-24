import { useContext, useState } from 'react'
import { observer } from 'mobx-react-lite'
import ScoreReveal from './ScoreReveal'
import ScoreHide from './ScoreHide'
import Button from '../components/Button'
import './makeOfferModal.css'

import Trustlist from '../contexts/Trustlist'
import User from '../contexts/User'

type Props = {
    listingId: string
    listingTitle: string
    setShowMakeOffer: (value: boolean) => void
}

type ReqInfo = {
    nonce: number
}

type ProofInfo = {
    publicSignals: string[]
    proof: string[]
    valid: boolean
}

export default observer(
    ({ listingId, listingTitle, setShowMakeOffer }: Props) => {
        const app = useContext(Trustlist)
        const user = useContext(User)

        const [offerAmount, setOfferAmount] = useState('')
        const [rScores, setRScores] = useState<{
            [key: number]: number | string
        }>({ 0: 'X', 1: 'X', 2: 'X', 3: 'X' })
        const [hidden, setHidden] = useState<{
            [key: number]: boolean
        }>({ 0: true, 1: true, 2: true, 3: true })
        const [proveData, setProveData] = useState<{
            [key: number]: number | string
        }>({})
        const [reqInfo, setReqInfo] = useState<ReqInfo>({ nonce: 0 })
        const [repProof, setRepProof] = useState<ProofInfo>({
            publicSignals: [],
            proof: [],
            valid: false,
        })

        if (!user.userState) {
            return <div className="container">Loading...</div>
        }

        return (
            <div className="dark-bg">
                <div className="centered">
                    <div className="nested">
                        <form>
                            <div className="offer-content">
                                <div className="offer-container">
                                    <div className="">
                                        <label
                                            htmlFor="offerAmount"
                                            style={{
                                                fontSize: '1.2rem',
                                                fontWeight: '600',
                                                paddingLeft: '3rem',
                                            }}
                                        >
                                            amount: $
                                        </label>
                                        <input
                                            type="text"
                                            id="offerAmount"
                                            name="offerAmount"
                                            onChange={(e) =>
                                                setOfferAmount(e.target.value)
                                            }
                                            className="offer-input"
                                        />
                                    </div>

                                    <div className="score-grid">
                                        {app.scoreNames.map((name, i) => {
                                            const score = Number(
                                                user.provableData[i]
                                            )
                                            return (
                                                <div
                                                    key={name}
                                                    className="reveal-container"
                                                >
                                                    <div className="score-name">
                                                        {name} Score:{' '}
                                                        {app.calcScoreFromUserData(
                                                            score
                                                        )}
                                                        %
                                                    </div>
                                                    <div className="icon-container">
                                                        <div
                                                            onClick={() => {
                                                                setHidden(
                                                                    () => ({
                                                                        ...hidden,
                                                                        [i]: false,
                                                                    })
                                                                )
                                                                setRScores(
                                                                    () => ({
                                                                        ...rScores,
                                                                        [i]: score,
                                                                    })
                                                                )
                                                                setProveData(
                                                                    () => ({
                                                                        ...proveData,
                                                                        [i]: score,
                                                                    })
                                                                )
                                                            }}
                                                        >
                                                            <ScoreReveal
                                                                hidden={
                                                                    hidden[i]
                                                                }
                                                            />
                                                        </div>
                                                        <div
                                                            onClick={() => {
                                                                setHidden(
                                                                    () => ({
                                                                        ...hidden,
                                                                        [i]: true,
                                                                    })
                                                                )
                                                                setRScores(
                                                                    () => ({
                                                                        ...rScores,
                                                                        [i]: 'X',
                                                                    })
                                                                )
                                                            }}
                                                        >
                                                            <ScoreHide
                                                                hidden={
                                                                    hidden[i]
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div className="offer-buttons">
                                    <div style={{ display: 'flex' }}>
                                        <select
                                            value={reqInfo.nonce ?? 0}
                                            onChange={(event) => {
                                                setReqInfo((v) => ({
                                                    ...v,
                                                    nonce: Number(
                                                        event.target.value
                                                    ),
                                                }))
                                            }}
                                        >
                                            <option value="0">0</option>
                                            <option value="1">1</option>
                                            {/* <option value="2">2</option> */}
                                        </select>
                                        <p style={{ fontSize: '12px' }}>
                                            submit offer with epoch key:
                                        </p>
                                    </div>
                                    <p className="epoch-key">
                                        {user.epochKey(reqInfo.nonce ?? 0)}
                                    </p>
                                    <div style={{ display: 'flex' }}>
                                        {repProof.proof.length ? (
                                            <div className="proof">
                                                {repProof.valid ? '✅' : '❌'}
                                            </div>
                                        ) : null}
                                        <Button
                                            onClick={async () => {
                                                if (!offerAmount) {
                                                    window.alert(
                                                        'please provide an amount for your offer.'
                                                    )
                                                    return
                                                }
                                                if (
                                                    Number(offerAmount) > 9999
                                                ) {
                                                    window.alert(
                                                        'please choose an amount less than 10,000.'
                                                    )
                                                    return
                                                }
                                                const proof =
                                                    await user.proveData(
                                                        proveData
                                                    )
                                                setRepProof(proof)
                                            }}
                                        >
                                            prove trust scores
                                        </Button>
                                    </div>
                                    {/* only allow offer submit after valid proof */}
                                    {repProof.valid ? (
                                        <input
                                            style={{ marginTop: '0.5rem' }}
                                            type="submit"
                                            value="SUBMIT OFFER"
                                            onClick={() => {
                                                const epoch =
                                                    user.userState?.sync.calcCurrentEpoch()
                                                const responderId =
                                                    user.epochKey(
                                                        reqInfo.nonce ?? 0
                                                    )
                                                const scoreString =
                                                    JSON.stringify(rScores)
                                                app.submitOffer(
                                                    epoch,
                                                    listingId,
                                                    listingTitle,
                                                    responderId,
                                                    offerAmount,
                                                    scoreString
                                                )
                                            }}
                                        />
                                    ) : (
                                        <button
                                            style={{ marginTop: '0.5rem' }}
                                            className="blocked"
                                        >
                                            SUBMIT OFFER
                                        </button>
                                    )}
                                </div>
                            </div>
                            <button
                                className="close-btn"
                                onClick={() => setShowMakeOffer(false)}
                            >
                                X
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
)
