import { useContext, useState, useEffect, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { TrustScoreKeyEnum, listingCategories, trustScores } from '@/data'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { z } from 'zod'
import { cn } from '@/utils/cn'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import ScoreReveal from './ScoreReveal'
import ScoreHide from './ScoreHide'
import Button from '../components/Button'
import './makeOfferModal.css'
import useTrustlist from '@/hooks/useTrustlist'

import Trustlist from '../contexts/Trustlist'
import User from '../contexts/User'

type Props = {
    listingId: string
    listingTitle: string
    setShowMakeOffer: (value: boolean) => void
}

export default observer(
    ({ listingId, listingTitle, setShowMakeOffer }: Props) => {
        const { calcScoreFromUserData, makeOffer } = useTrustlist()
        const app = useContext(Trustlist)
        const user = useContext(User)

        const [offerAmount, setOfferAmount] = useState('')
        const [rScores, setRScores] = useState<string[]>([])
        const [isRevealed, setIsRevealed] = useState([true, true, true, true])
        // const [rScores, setRScores] = useState<{
        //   [key: string]: string
        // }>({ "LP": '',"LO": '', "CB": '', "GV": '' })
        // const [isRevealed, setIsRevealed] = useState<{
        //   [key: string]: boolean
        // }>({ "LP": true, 'LO': true, "CB": true, "GV": true })

        const updateScores = useCallback(() => {
            let scores: string[] = []
            if (user.provableData.length === 0) return
            for (let i = 0; i < 4; i++) {
                let cumulativeScore = calcScoreFromUserData(
                    Number(user.provableData[i])
                )
                if (isRevealed[i]) {
                    scores.push(String(cumulativeScore))
                } else {
                    scores.push('X')
                }
            }
            setRScores(scores)
        }, [user.provableData])

        useEffect(() => {
            updateScores()
        }, [])

        const autoTransition = async () => {
            await user.transitionToCurrentEpoch()
            updateScores()
        }

        const transitionAlert = () =>
            toast.promise(autoTransition, {
                pending:
                    'Please wait a moment while you are tranistioned to the current epoch...',
                success:
                    'Transition successful!  Please confirm whether you would like your updated scores to be shown and re-submit your offer.',
                error: 'Failed to transition to the current epoch, please try again in a moment.',
            })

        const getEpochAndKey = async () => {
            const { userState } = user
            if (!userState)
                throw new Error('Please join as a member and try again')
            let userStateUpdated = false
            const currentEpoch = userState.sync.calcCurrentEpoch()
            if (currentEpoch !== (await userState.latestTransitionedEpoch())) {
                // transition user to the current epoch if they're not on it
                try {
                    transitionAlert()
                    console.log('transitioning...')
                } catch (error) {
                    throw new Error('Failed to transition to the new epoch')
                }
                userStateUpdated = true
            }

            const epkNonce = Math.floor(Math.random() * 3) // randomly choose between 2 and 0
            const responderId = user.epochKey(epkNonce)

            return {
                userUpdated: userStateUpdated,
                currentEpoch: currentEpoch,
                userEpochKey: responderId,
                nonce: epkNonce,
            }
        }

        const submitOfferAlert = (newData: any) =>
            toast.promise(async () => makeOffer(newData), {
                pending:
                    'Please wait a moment while your offer is being submitted...',
                success: {
                    render: (
                        <div className="flex space-around gap-3">
                            <div>
                                <div>
                                    Offer submitted! One "offered" point will be
                                    added to your LO score if your offer is
                                    accepted by the lister.
                                </div>
                                <div>
                                    Please complete your deal during this epoch
                                    to build your Legitimate Offer reputation.
                                </div>
                            </div>
                            <button
                                className="text-white font-lg border-1 border-white px-4 py-2"
                                onClick={() => {
                                    setShowMakeOffer(false)
                                    window.location.reload()
                                }}
                            >
                                Home
                            </button>
                        </div>
                    ),
                    closeButton: false,
                },
                error: 'There was a problem submitting your offer, please try again.',
            })

        const submitOffer = async () => {
            try {
                const epochAndKey = await getEpochAndKey()
                if (!epochAndKey) {
                    throw new Error('Failed to get epoch and key')
                }
                const { userUpdated, currentEpoch, userEpochKey, nonce } =
                    epochAndKey
                if (userUpdated) return

                try {
                    const newData = {
                        epoch: currentEpoch,
                        listingId: listingId,
                        listingTitle: listingTitle,
                        responderId: userEpochKey,
                        amount: offerAmount,
                        scoreString: JSON.stringify(rScores),
                    }
                    console.log({ newData })
                    submitOfferAlert(newData)
                } catch (publishingError) {
                    console.error(
                        'Error while submitting offer: ',
                        publishingError
                    )
                }
            } catch (epochError) {
                console.error('Error while getting epoch and key: ', epochError)
            }
        }

        return (
            <div className="dark-bg">
                <div className="detail-centered">
                    <div className="nested">
                        <div className="offer-content">
                            <div className="offer-container">
                                <h6 className="text-sm font-semibold tracking-widest uppercase text-foreground/70">
                                    New Offer
                                </h6>

                                <section className="flex flex-col space-y-4">
                                    <label htmlFor="offerAmount" className="">
                                        Amount
                                    </label>
                                    <Input
                                        className="text-base"
                                        type="text"
                                        id="offerAmount"
                                        name="offerAmount"
                                        onChange={(e) =>
                                            setOfferAmount(e.target.value)
                                        }
                                        // className="offer-input"
                                    />
                                </section>

                                <section className="flex flex-col space-y-4">
                                    {app.scoreNames.map((name, i) => (
                                        <div
                                            key={name}
                                            className="flex justify-between items-start space-x-6 border border-muted-foreground p-3"
                                        >
                                            <div className="w-3/4">
                                                <div className="text-foreground text-lg">
                                                    {app.scoreNames[i]}:{' '}
                                                    <span className="text-blue-700 font-extrabold">
                                                        {rScores[i]}
                                                        {rScores[i] === 'n/a'
                                                            ? null
                                                            : '%'}
                                                    </span>
                                                </div>
                                                <div className="text-sm font-light">
                                                    {app.scoreDescriptions[i]}
                                                </div>
                                            </div>

                                            <div className="w-1/4 flex-col items-center justify-center">
                                                <Switch
                                                    id={name}
                                                    checked={isRevealed[i]}
                                                    // onCheckedChange={}
                                                    className={
                                                        isRevealed[i]
                                                            ? 'data-[state=checked]:bg-blue-700'
                                                            : ''
                                                    }
                                                />
                                                <p className="text-muted-foreground">
                                                    {isRevealed[i]
                                                        ? 'Show'
                                                        : 'Hide'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </section>

                                {/* <
                          const scoreString =
                              JSON.stringify(rScores)
                          const message =
                              await app.submitOffer(
                                  epoch,
                                  listingId,
                                  listingTitle,
                                  responderId,
                                  offerAmount,
                                  scoreString
                              )
                          window.alert(message)
                          setShowMakeOffer(false)
                          window.location.reload()
                  /> */}

                                <button
                                    className="px-2 py-1 bg-blue-600 hover:bg-blue-400 text-background"
                                    onClick={async () => {
                                        submitOffer()
                                    }}
                                >
                                    Submit offer
                                </button>
                            </div>

                            <ToastContainer
                                className="listing-toast"
                                toastClassName="toast"
                                bodyClassName="toast-body"
                                position="bottom-center"
                                autoClose={false}
                            />
                            <button
                                className="close-btn"
                                onClick={() => setShowMakeOffer(false)}
                            >
                                X
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
)
