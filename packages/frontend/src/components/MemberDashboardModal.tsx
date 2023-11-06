import { useContext, useState, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { Link } from 'react-router-dom'
import Tooltip from './Tooltip'
import {Button} from './ui/button'
import DetailModal from './DetailModal'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './memberDashboardModal.css'

import Trustlist from '../contexts/Trustlist'
import User from '../contexts/User'

type Props = {
  setShowMemberDash: (value: boolean) => void
}

type CurrentListing = {
  _id: string
  section: string
  category: string
  title: string
  amount: string
  offerAmount: string
  dealOpened: boolean
  posterDealClosed: boolean
  responderDealClosed: boolean
}

type CurrentOffer = {
  _id: string
  listingId: string
  listingTitle: string
  offerAmount: string
}

export default observer(({ setShowMemberDash }: Props) => {
  const app = useContext(Trustlist)
  const user = useContext(User)
  const [showDetail, setShowDetail] = useState<boolean>(false)
  const [detailData, setDetailData] = useState<any>()

  useEffect(() => {
    const loadData = async () => {
      const epochKeys = [user.epochKey(0), user.epochKey(1)]
      await app.loadMemberActivity(epochKeys)
    }
    loadData()
  }, [])
  const deals = app.memberActiveDeals
  const listings = app.memberActiveListings
  const offers = app.memberActiveOffers
  const transitionSuccess = () => toast.success("Transition successful! Your provable data has been updated and you can now participate in the current epoch.");
  const transitionFailed = () => toast.error("Failed to transition to the current epoch.");

  return (
    <div className="dark-bg">
      <div className="centered">
        <div className="modal">
          <div className="dash-content">
            <div className="stats-container">
              <div>
                <div>
                <h3 className='py-3 text-lg font-semibold'>my latest trust scores:</h3>
                </div>
                {app.scoreDescriptions.map((desc, i) => {
                  const initiated = user.data[i] ? Number(user.data[i] >> BigInt(23)) : 0
                  const completed = user.data[i] ? Number(user.data[i] % BigInt(128)) : 0
                  return (
                    <div key={i}>
                      <div className="score-detail">
                        <div style={{ display: 'flex', justifyContent: 'space-between',}}>
                          <Tooltip
                            text={desc}
                            content={
                              <img
                                src={require('../../public/info_icon.svg')}
                                alt="info icon"
                              />
                            }
                          />
                          <div style={{ paddingLeft: '0.3rem' }}>
                            {app.scoreNames[i]}{' '}score:
                          </div>
                        </div>

                        <div className="transition">
                          <div className="line"></div>
                          <Button 
                            // loadingText='transitioning...'
                            onClick={async () => {
                              try {
                                await user.transitionToCurrentEpoch()
                                transitionSuccess()
                              } catch (error) {
                                transitionFailed()
                              }
                            }}
                          >
                            TRANSITION
                          </Button>
                          <div className="line"></div>
                          <ToastContainer className='dash-toast' toastClassName='toast' position='top-center' autoClose={4000} />
                        </div>
                        {initiated === 0 ? 
                          <div className="stat">n/a</div>
                        :
                          <div className="stat">{Math.floor((completed / initiated) * 100)}%</div>
                        }
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="transition">
                <div className="line"></div>
                <Button 
                  // loadingText='transitioning...'
                  onClick={async () => {
                    try {
                      await user.transitionToCurrentEpoch()
                      transitionSuccess()
                    } catch (error) {
                      transitionFailed()
                    }
                  }}
                >
                  TRANSITION
                </Button>
                <div className="line"></div>
                <ToastContainer className='dash-toast' toastClassName='toast' position='top-center' autoClose={4000} />
              </div>

              <div>
                <div>
                  <h3 className='pt-8 pb-3 text-lg font-semibold'>my provable trust scores:</h3>
                </div>
                {app.scoreDescriptions.map((desc, i) => {
                  const initiated = user.provableData[i] ? Number( user.provableData[i] >> BigInt(23)) : 0
                  const completed = user.provableData[i] ? Number(user.provableData[i] % BigInt(128)) : 0
                  return (
                    <div key={i}>
                      <div className="score-detail">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Tooltip
                            text={desc}
                            content={
                              <img
                                src={require('../../public/info_icon.svg')}
                                alt="info icon"
                              />
                            }
                          />
                          <div style={{ paddingLeft:'0.3rem' }}>{app.scoreNames[i]}{' '}score:</div>
                        </div>
                        <div className="stat">
                          {completed}/{initiated}
                        </div>
                        {initiated === 0 ?
                          <div className="stat">
                            n/a
                          </div>
                        : 
                          <div className="stat">
                            {Math.floor((completed / initiated) * 100)}%
                          </div>
                        }
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="activity-container">
              <h4>my deals</h4>
              <div className="scroll-container">
                {deals && deals.length > 0 ? 
                  deals.map((deal: CurrentListing) => (
                    <Link to={`deal/${deal._id}`}>
                      <li
                        key={deal._id}
                        onClick={() => setShowMemberDash(false)}
                      >
                        {deal.posterDealClosed && deal.responderDealClosed ? 
                          <span style={{ color: 'red' }}>CLOSED -{' '}</span>
                        : 
                          <span style={{ color: 'green' }} >OPEN -{' '}</span>
                        }
                        {deal.title} / ${deal.offerAmount}
                      </li>
                    </Link>
                  ))
                :
                  <h5>no open deals in this epoch</h5>
                }
              </div>

              <h4>my listings</h4>
              <div className="scroll-container">
                {listings && listings.length > 0 ? 
                  listings.map((listing: CurrentListing) => (
                    <>
                      <li
                        key={listing._id}
                        onClick={() => {
                          setDetailData(listing)
                          setShowDetail(true)
                        }}
                      >
                        {listing.title} / ${listing.amount}
                      </li>
                      {showDetail && <DetailModal listing={detailData} key={listing._id} setShowDetail={setShowDetail} />}
                    </>
                  ))
                : 
                  <h5>no listings in this epoch</h5>
                }
              </div>

              <h4>my offers</h4>
              <div className="scroll-container">
                {offers && offers.length > 0 ? 
                  offers.map((offer: CurrentOffer) => (
                    <>
                      <li
                        key={offer._id}
                        onClick={async () => {
                          await app.loadDealById(offer.listingId)
                          setDetailData(app.listingsById.get(offer.listingId))
                          setShowDetail(true)
                        }}
                      >
                        {offer.listingTitle} / ${offer.offerAmount}
                      </li>
                      {showDetail && <DetailModal listing={detailData} key={offer.listingId} setShowDetail={setShowDetail} />}
                    </>
                  ))
                : 
                  <h5>no offers in this epoch</h5>
                }
              </div>
            </div>
          </div>

          <button className="close-btn" onClick={() => setShowMemberDash(false)}>X</button>

        </div>
      </div>
    </div>
  )
})
