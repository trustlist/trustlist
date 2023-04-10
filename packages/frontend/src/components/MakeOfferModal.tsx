import React from 'react'
import { observer } from 'mobx-react-lite'
import Button from '../components/Button'
import Tooltip from '../components/Tooltip'
import './makeOfferModal.css'

import Trustlist from '../contexts/Trustlist'
import User from '../contexts/User'

type Props = {
  listingId: string;
  section: string;
  setShowMakeOffer: (value: boolean) => void;
}

export default observer(({ listingId, section, setShowMakeOffer }: Props) => {
  const app = React.useContext(Trustlist)
  const user = React.useContext(User)

  const [offerAmount, setOfferAmount] = React.useState('')
  const [score1, setScore1] = React.useState('')
  const [score2, setScore2] = React.useState('')
  const [score3, setScore3] = React.useState('')
  const [score4, setScore4] = React.useState('')
  const responderId = '12345'

  return (
    <div className='dark-bg'>
      <div className='centered'>
        <div className='nested'>
          {/* <form> */}
            <div className='offer-content'>
              {/* <div>{listingId}</div> */}
              <div className='offer-container'>
                    <div className=''>
                        <label htmlFor='offerAmount' style={{fontSize: '1rem', fontWeight: '600'}}>amount: $</label>
                        <input 
                          type='text' 
                          id='offerAmount' 
                          name='offerAmount' 
                          onChange={(e) => setOfferAmount(e.target.value)}
                          className='offer-input'
                        />
                    </div>
                    <div>
                        <label htmlFor='score1'>reveal score1</label>
                        <input 
                          type='text' 
                          id='score1' 
                          name='score1' 
                          onChange={(e) => setScore1(e.target.value)}
                          className='offer-input'
                        />
                     </div>
                     <div>   
                        <label htmlFor='score2'>reveal score2</label>
                        <input 
                          type='text' 
                          id='score2' 
                          name='score2' 
                          onChange={(e) => setScore2(e.target.value)}
                          className='offer-input'
                        />
                     </div>
                     <div>   
                        <label htmlFor='score3'>reveal score3</label>
                        <input 
                          type='text' 
                          id='score3' 
                          name='score3' 
                          onChange={(e) => setScore3(e.target.value)}
                          className='offer-input'
                        />
                     </div>
                     <div>
                        <label htmlFor='score4'>reveal score4</label>
                        <input 
                          type='text' 
                          id='score4' 
                          name='score4' 
                          onChange={(e) => setScore4(e.target.value)}
                          className='offer-input'
                        />
                      </div>
              </div>
              
              <div className='offer-buttons'>
                  <Button>prove trust scores</Button>
                  <button 
                    style={{marginTop: '1rem'}}
                    type='submit'
                    onClick={() => app.submitOffer(listingId, section, responderId, offerAmount, score1, score2, score3, score4)}
                  >
                    submit offer
                  </button>
              </div>
            </div>

                
          <button className='close-btn' onClick={() => setShowMakeOffer(false)}>X</button>
          {/* </form> */}
        </div>
      </div>
    </div>
  )
  })