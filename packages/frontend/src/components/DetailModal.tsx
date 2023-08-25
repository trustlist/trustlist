import { useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import MakeOfferModal from './MakeOfferModal'
import Tooltip from '../components/Tooltip'
import './detailModal.css'

import Trustlist from '../contexts/Trustlist'
import User from '../contexts/User'

type Props = {
    listing: {
        _id: string
        epoch: number | undefined
        section: string
        title: string
        amount: string
        amountType: string
        description: string
        posterId: string
        scoreString: string
        offerAmount: string
        responderId: string
        dealOpened: boolean
        posterDealClosed: boolean
        responderDealClosed: boolean
    }
    setShowDetail: (value: boolean) => void
}

type Offer = {
    _id: string
    offerAmount: string
    responderId: string
    scoreString: string
}

export default observer(({ listing, setShowDetail }: Props) => {
    const app = useContext(Trustlist)
    const user = useContext(User)
    const navigate = useNavigate()
    const [showMakeOffer, setShowMakeOffer] = useState<boolean>(false)

    useEffect(() => {
        const loadData = async () => {
            await app.loadOffers(listing._id)
        }
        loadData()
    }, [])
    const offers = app.offersByListingId.get(listing._id)
    const memberKeys = [user.epochKey(0), user.epochKey(1)]
    const pScores = JSON.parse(listing.scoreString)
    const posterScores = app.calcScoresFromDB(pScores)

    return (
        <div className="dark-bg">
            <div className="centered">
                <div className="modal">
                    <div className="detail-content">
                        <div className="action-bar">
                            <div className="action-item">
                                {user.hasSignedUp &&
                                // prevent user from making an offer on their own post
                                // !memberKeys.includes(listing.posterId) &&
                                // prevent new offers if one has already been accepted
                                !listing.dealOpened &&
                                // prevent new offers if listing epoch is expired
                                listing.epoch ===
                                    user.userState?.sync.calcCurrentEpoch() ? (
                                    <>
                                        <button
                                            onClick={() =>
                                                setShowMakeOffer(true)
                                            }
                                        >
                                            make an offer
                                        </button>
                                        {showMakeOffer && (
                                            <MakeOfferModal
                                                listingId={listing._id}
                                                listingTitle={listing.title}
                                                setShowMakeOffer={
                                                    setShowMakeOffer
                                                }
                                            />
                                        )}
                                    </>
                                ) : null}
                                {memberKeys.includes(listing.posterId) ? (
                                    <button
                                        style={{
                                            color: 'red',
                                            borderColor: 'red',
                                        }}
                                    >
                                        my listing
                                    </button>
                                ) : null}
                                {listing.epoch !=
                                user.userState?.sync.calcCurrentEpoch() ? (
                                    <button
                                        style={{
                                            color: 'red',
                                            borderColor: 'red',
                                        }}
                                    >
                                        EXPIRED
                                    </button>
                                ) : null}
                            </div>
                            <div className="action-item">
                                <div>⭐️</div>
                                <div>favorite</div>
                            </div>
                            <div className="action-item">
                                <div>🚫</div>
                                <div>hide</div>
                            </div>
                            <div className="action-item">
                                <div>🚩</div>
                                <div>flag</div>
                            </div>
                            <div className="action-item">
                                <div>📤</div>
                                <div>share</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex' }}>
                            <div className="detail-container">
                                <div className="detail-title">
                                    <div>{listing.title.slice(0, 60)}</div>
                                    <div style={{ color: 'blue' }}>
                                        ${listing.amount} / {listing.amountType}
                                    </div>
                                </div>
                                <div className="detail-description">
                                    {listing.description}
                                </div>
                            </div>
                            <div className="trust-container">
                                {app.scoreDescriptions.map((desc, i) => (
                                    <div style={{ display: 'flex' }}>
                                        <div className="detail-tooltip">
                                            <Tooltip
                                                text={desc}
                                                content={
                                                    <img
                                                        src={require('../../public/info_icon.svg')}
                                                        alt="info icon"
                                                    />
                                                }
                                            />
                                        </div>
                                        <div className="trust-item">
                                            <div>
                                                {app.scoreNames[i]} score:
                                            </div>
                                            <div style={{ fontWeight: '600' }}>
                                                {posterScores[i] === 9999999 ? (
                                                    <img
                                                        src={require('../../public/not_visible.svg')}
                                                        alt="eye with slash"
                                                    />
                                                ) : posterScores[i] === 0 ? (
                                                    '...'
                                                ) : (
                                                    <div>
                                                        {String(
                                                            posterScores[i]
                                                        )}{' '}
                                                        %
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="offers-container">
                            {listing.dealOpened ? (
                                <div style={{ display: 'flex' }}>
                                    <div
                                        style={{
                                            textDecoration: 'line-through',
                                        }}
                                    >
                                        pending offers
                                    </div>
                                    {listing.posterDealClosed &&
                                    listing.responderDealClosed ? (
                                        <div style={{ display: 'flex' }}>
                                            <div
                                                style={{
                                                    color: 'red',
                                                    paddingLeft: '1rem',
                                                }}
                                            >
                                                deal completed
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            style={{
                                                color: 'green',
                                                paddingLeft: '1rem',
                                            }}
                                        >
                                            deal pending
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div style={{ color: 'blue' }}>
                                    pending offers
                                </div>
                            )}

                            <div className="offer-scroll">
                                {offers && offers.length > 0
                                    ? offers.map((offer: Offer) => {
                                          const rScores = JSON.parse(
                                              offer.scoreString
                                          )
                                          const responderScores =
                                              app.calcScoresFromDB(rScores)
                                          return (
                                              <div
                                                  key={offer._id}
                                                  className="offer"
                                              >
                                                  <div>
                                                      <span
                                                          style={{
                                                              color: 'blue',
                                                          }}
                                                      >
                                                          ${offer.offerAmount}{' '}
                                                      </span>{' '}
                                                      ---- offering member's
                                                      scores:{' '}
                                                  </div>
                                                  {responderScores.map(
                                                      (score, i) => (
                                                          <div className="offer-score">
                                                              <span
                                                                  style={{
                                                                      fontWeight:
                                                                          '300',
                                                                  }}
                                                              >
                                                                  {
                                                                      app
                                                                          .scoreNames[
                                                                          i
                                                                      ]
                                                                  }
                                                                  :{' '}
                                                              </span>
                                                              {score ===
                                                              9999999 ? (
                                                                  <img
                                                                      src={require('../../public/not_visible.svg')}
                                                                      alt="eye with slash"
                                                                  />
                                                              ) : score ===
                                                                0 ? (
                                                                  '...'
                                                              ) : (
                                                                  String(score)
                                                              )}
                                                          </div>
                                                      )
                                                  )}

                                                  {listing.responderId ===
                                                  offer.responderId ? (
                                                      <button className="offer-accepted">
                                                          accepted
                                                      </button>
                                                  ) : memberKeys.includes(
                                                        listing.posterId
                                                    ) && !listing.dealOpened ? (
                                                      <button
                                                          className="accept"
                                                          onClick={async () => {
                                                              const message =
                                                                  await app.dealOpen(
                                                                      listing._id,
                                                                      offer.offerAmount,
                                                                      offer.responderId
                                                                  )
                                                              window.alert(
                                                                  message
                                                              )
                                                              navigate(
                                                                  `deal/${listing._id}`
                                                              )
                                                          }}
                                                      >
                                                          accept deal
                                                      </button>
                                                  ) : null}
                                              </div>
                                          )
                                      })
                                    : 'no offers yet'}
                            </div>
                        </div>

                        <button
                            className="close-btn"
                            onClick={() => setShowDetail(false)}
                        >
                            X
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
})
