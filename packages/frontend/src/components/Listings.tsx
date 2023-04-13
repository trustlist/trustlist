import React from 'react'
import { Link } from "react-router-dom";
import { observer } from 'mobx-react-lite'
import DetailModal from './DetailModal';
import './listings.css'

import Trustlist from '../contexts/Trustlist';

type Props = {
  section: string;
  category: string
}

type Listing = {
  _id: string;
  section: string;
  title: string;
  amount: string;
  amountType: string;
  description: string;
  score1: string;
  score2: string;
  score3: string;
  score4: string;
  responderId: string;
  offerAmount: string;
  rScore1: string;
  rScore2: string;
  rScore3: string;
  rScore4: string;
}

export default observer(({ section, category }: Props) => {
  
  const app = React.useContext(Trustlist)
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
        listings.slice().reverse().map((listing: Listing) => (
          <>
            <div className='listing-item' key={listing._id} onClick={() => setShowDetail(true)}>
              <div className='thumbnail'>TL</div>
              <div>
                <div className='listing-title'>{listing.title}</div>
                    <div>reserve amount: ${listing.amount}</div>
                    <div style={{marginRight: '200px'}}>current offers: 1</div>
              </div>
              <div>
                <div className='score-container'>
                  <div className='score-item'>{listing.score1}</div>
                  <div className='score-item'>{listing.score2}</div>
                </div>
                <div className='score-container'>
                  <div className='score-item'>{listing.score3}</div>
                  <div className='score-item'>{listing.score4}</div>
                </div>
              </div>
            </div>
            {showDetail && <DetailModal listing={listing} key={listing._id} setShowDetail={setShowDetail} />}
          </>
        )) : null}
    </div>
  )
})