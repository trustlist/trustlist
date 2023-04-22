import React from 'react'
import { Link } from "react-router-dom";
import { observer } from 'mobx-react-lite'
import DetailModal from './DetailModal';
import './listings.css'

import Trustlist from '../contexts/Trustlist';
import User from '../contexts/User';

type Props = {
  section: string;
  category: string
}

type Listing = {
  _id: string;
  epoch: number | undefined;
  section: string;
  title: string;
  amount: string;
  amountType: string;
  description: string;
  pScore1: string;
  pScore2: string;
  pScore3: string;
  pScore4: string;
  responderId: string;
  offerAmount: string;
  rScore1: string;
  rScore2: string;
  rScore3: string;
  rScore4: string;
}

export default observer(({ section, category }: Props) => {
  
  const app = React.useContext(Trustlist)
  const user = React.useContext(User)
  const [showDetail, setShowDetail] = React.useState<boolean>(false)
  React.useEffect(() => {
    const loadData = async () => {
      await app.loadSelectedCategory(section, category)
    }
    loadData()
  }, [])

  let listings = []
  if (section === 'for sale') {
    listings = app.forSaleByCategory.get(category)
  } else if (section === 'housing') {
    listings = app.housingByCategory.get(category)
  } else if (section === 'jobs') {
    listings = app.jobsByCategory.get(category)
  } else {
    listings = app.servicesByCategory.get(category)
  }

  return (
    <div className='listings'>
      {listings ? null : <div className='message'>this section is under construction.</div>}
      {listings ? 
        listings.map((listing: Listing) => (
          <>
            {listing.epoch === user.userState?.sync.calcCurrentEpoch() ?
              <>
                <div className='listing-item' key={listing._id} onClick={() => setShowDetail(true)}>
                  <div className='thumbnail'>TL</div>
                  <div>
                    <div className='listing-title'>{listing.title}</div>
                        <div>reserve amount: ${listing.amount}</div>
                        <div style={{marginRight: '200px'}}>current offers: 1</div>
                        <div style={{fontSize: '0.4rem', cursor: 'pointer'}} onClick={() => app.removeListing(listing._id)}>delete</div>
                  </div>
                  <div>
                    <div className='score-container'>
                      <div className='score-item'>{listing.pScore1}</div>
                      <div className='score-item'>{listing.pScore2}</div>
                    </div>
                    <div className='score-container'>
                      <div className='score-item'>{listing.pScore3}</div>
                      <div className='score-item'>{listing.pScore4}</div>
                    </div>
                  </div>
                </div>
                {showDetail && <DetailModal listing={listing} key={listing._id} setShowDetail={setShowDetail} />}
              </> : 
              <>
                <div className='listing-expired' key={listing._id}>
                  <div className='thumbnail'>TL</div>
                  <div>
                    <div className='listing-title'>{listing.title}</div>
                        <div>reserve amount: ${listing.amount}</div>
                        <div style={{marginRight: '200px', color: 'black'}}>EXPIRED</div>
                        <div style={{fontSize: '0.4rem', cursor: 'pointer'}} onClick={() => app.removeListing(listing._id)}>delete</div>
                  </div>
                  <div>
                    <div className='score-container'>
                      <div className='score-item'>{listing.pScore1}</div>
                      <div className='score-item'>{listing.pScore2}</div>
                    </div>
                    <div className='score-container'>
                      <div className='score-item'>{listing.pScore3}</div>
                      <div className='score-item'>{listing.pScore4}</div>
                    </div>
                  </div>
                </div>
              </> }
          </>

        )) : null}
    </div>
  )
})