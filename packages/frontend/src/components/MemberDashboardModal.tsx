import React from 'react'
import { observer } from 'mobx-react-lite'
import { Link } from 'react-router-dom'
import Button from '../components/Button'
import DetailModal from './DetailModal'
import './memberDashboardModal.css'

import Trustlist from '../contexts/Trustlist'
import User from '../contexts/User'

type Props = {
  setShowMemberDash: (value: boolean) => void;
}

type CurrentListing = {
  _id: string;
  // epoch: number | undefined;
  section: string;
  category: string;
  title: string;
  amount: string;
  offerAmount: string,
  // amountType: string;
  // description: string;
  // pScore1: string;
  // pScore2: string;
  // pScore3: string;
  // pScore4: string;
  // offerAmount: string;
  dealOpened: boolean;
  dealClosed: boolean;
}

type CurrentOffer = {
  _id: string,
  listingId: string,
  offerAmount: string,
}

export default observer(({ setShowMemberDash }: Props) => {
  const app = React.useContext(Trustlist)
  const user = React.useContext(User)
  const [showDetail, setShowDetail] = React.useState<boolean>(false)
  const [detailData, setDetailData] = React.useState<any>()

  React.useEffect(() => {
    const loadData = async () => {
      const epochKeys = [user.epochKey(0), user.epochKey(1), user.epochKey(2)]
      await app.loadMemberActivity(epochKeys)
    }
    loadData()
  }, [])
  const deals = app.memberActiveDeals
  const listings = app.memberActiveListings
  const offers = app. memberActiveOffers

  return (
    <div 
      className='dark-bg' 
      // onClick={() => setMemberDashIsOpen(false)}
    >
      <div className='centered'>
        <div className='modal'>
          <div className='modal-content'>
            <div className='dash-content'>
              
              <div className="stats-container"> 
                <div>  
                  <div>
                    <h3>my latest trust scores:</h3>
                  </div>
                  {user.data.map((data, i) => {
                    const expected = data ? Number(data >> BigInt(23)) : 0
                    const received = data ? Number(data % BigInt(128)) : 0 
                    return (
                      <div key={i}>
                        {i < 3 ? (
                          <>
                            <div>Score {i + 1}</div>
                            <div className="score-detail">
                              <div>{(data || 0).toString()}</div>
                              <div>{expected}/{received}</div>
                              <div>{Math.floor(received / expected * 100)}%</div>
                            </div>
                          </>
                        ) : null }
                        {i === 3 ? (
                          <>
                            <div>Score {i + 1}</div>
                            <div className="score-detail">
                              <div>{(data || 0).toString()}</div>
                              <div>{expected}/{received}</div>
                              <div>{Math.floor(((received / expected) / 5) * 100)}%</div>
                            </div>
                          </>
                        ) : null }
                      </div>
                    )
                  })}
                </div>                

                <div className='transition'>
                  <div className='line'></div>
                  <Button onClick={()=> user.stateTransition()}>TRANSITION</Button>
                  <div className='line'></div>
                </div>

                <div>
                  <div>
                    <h3>my provable trust scores:</h3>
                  </div>
                  {user.provableData.map((data, i) => {
                    const expected = data ? Number(data >> BigInt(23)) : 0
                    const received = data ? Number(data % BigInt(128)) : 0 
                    return (
                      <div key={i}>
                        {i < 3 ? (
                          <>
                            <div>Score {i + 1}</div>
                            <div className="score-detail">
                              <div>{(data || 0).toString()}</div>
                              <div>{expected}/{received}</div>
                              <div>{Math.floor(received / expected * 100)}%</div>
                            </div>
                          </>
                        ) : null }
                        {i === 3 ? (
                          <>
                            <div>Score {i + 1}</div>
                            <div className="score-detail">
                              <div>{(data || 0).toString()}</div>
                              <div>{expected}/{received}</div>
                              <div>{Math.floor(((received / expected) / 5) * 100)}%</div>
                            </div>
                          </>
                        ) : null }

                      </div>
                    )
                  })}
                </div>
              </div>

              <div className='activity-container'>
                <h4>deals awaiting my review</h4>
                <div className='scroll-container'>
                  {deals && deals.length > 0 ? 
                    deals.map((deal: CurrentListing) => (
                      <Link to={`deal/${deal._id}`}>
                        <h5 key={deal._id} onClick={() => setShowMemberDash(false)}>
                          {deal.dealClosed ? <span>CLOSED  - </span> : <span>OPEN  - </span>}
                          {deal.section} - {deal.category} - {deal.title} / ${deal.offerAmount}
                        </h5>
                      </Link>
                    )) : <h5>- no open deals in this epoch</h5> }         
                </div> 
                <h4>my open listings</h4>
                <div className='scroll-container'>
                  {listings && listings.length > 0 ? 
                    listings.map((listing: CurrentListing) => (
                      <>
                      <h5 
                        key={listing._id}
                        onClick={() => {
                          setDetailData(listing)
                          setShowDetail(true)
                        }}
                      >
                        {listing.section} - {listing.category} - {listing.title} / ${listing.amount}
                      </h5>
                      {showDetail && <DetailModal listing={detailData} key={listing._id} setShowDetail={setShowDetail} />}
                      </>
                    )) : <h5>- no listings in this epoch</h5> }
                </div>
                <h4>my pending offers</h4>
                <div className='scroll-container'>
                  {offers && offers.length > 0 ? 
                    offers.map((offer: CurrentOffer) => (
                      <>
                      <h5 
                        key={offer._id}
                        onClick={async () => {
                          await app.loadDealById(offer.listingId)
                          setDetailData(app.listingsById.get(offer.listingId))
                          setShowDetail(true)
                        }}
                      >
                        need to add desc to offer obj / ${offer.offerAmount}
                      </h5>
                      {showDetail && <DetailModal listing={detailData} key={offer.listingId} setShowDetail={setShowDetail} />}
                      </>
                    )) : <h5>- no listings in this epoch</h5>}
                </div>
              </div>             
            </div>

            <button className='close-btn' onClick={() => setShowMemberDash(false)}>X</button>
          </div>
        </div>
      </div>
    </div>
  )
})