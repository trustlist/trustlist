import React from 'react'
import { observer } from 'mobx-react-lite'
import Button from '../components/Button'
// import DetailModal from './DetailModal'
import './memberDashboardModal.css'

import Trustlist from '../contexts/Trustlist'
import User from '../contexts/User'

type Props = {
  setShowMemberDash: (value: boolean) => void;
}

export default observer(({ setShowMemberDash }: Props) => {
  const app = React.useContext(Trustlist)
  const user = React.useContext(User)

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
                  <div className='info-item'>
                    <h3>my latest trust scores:</h3>
                  </div>
                  {user.data.map((data, i) => {
                    return (
                      <div key={i} className="info-item">
                        <div>Score {i}</div>
                        <div className="stat">
                          {(data || 0).toString()}
                        </div>
                      </div>
                    )
                  })}
                  {/* <div className='info-item'>
                    <div>score 1</div>
                    <div className='stat'>{user.reputation.posRep?.toString()}</div>
                  </div>
                  <div className='info-item'>
                    <div>score 2</div>
                    <div className='stat'>{user.reputation.negRep?.toString()}</div>
                  </div>
                  <div className='info-item'>
                    <div>score 3</div>
                    <div className='stat'>{user.reputation.posRep?.toString()}</div>
                  </div>
                  <div className='info-item'>
                    <div>score 4</div>
                    <div className='stat'>{user.reputation.negRep?.toString()}</div>
                  </div> */}
                </div>

                

                <div className='transition'>
                  <div className='line'></div>
                  <Button onClick={()=> user.stateTransition()}>TRANSITION</Button>
                  <div className='line'></div>
                </div>

                <div>
                  <div className='info-item'>
                    <h3>my provable trust scores:</h3>
                  </div>
                  {user.provableData.map((data, i) => {
                    return (
                      <div key={i} className="info-item">
                        <div>Scores {i}</div>
                        <div className="stat">
                          {(data || 0).toString()}
                        </div>
                      </div>
                    )
                  })}
                  {/* <div className='info-item'>
                    <div>score 1</div>
                    <div className='stat'>{user.provableReputation.posRep?.toString()}</div>
                  </div>
                  <div className='info-item'>
                    <div>score 2</div>
                    <div className='stat'>{user.provableReputation.negRep?.toString()}</div>
                  </div>
                  <div className='info-item'>
                    <div>score 3</div>
                    <div className='stat'>{user.reputation.posRep?.toString()}</div>
                  </div>
                  <div className='info-item'>
                    <div>score 4</div>
                    <div className='stat'>{user.reputation.negRep?.toString()}</div>
                  </div> */}

                </div>
              </div>

              <div className='activity-container'>
                <div>awaiting my review</div>
                <div className='scroll-container'>
                  <h5>$  title of some listing / $250</h5>
                  <h5>$  the title of a different listing / $50</h5>
                  <h5>$  some other listing with a short description/ $100</h5>
                  <h5>$  hopefully i can figure out how to open these from here / $20</h5>
                  <h5>$  title of some listing / $250</h5>
                  <h5>$  title of some listing / $250</h5>
                </div> 
                <div>my open listings</div>
                <div className='scroll-container'>
                  <h5>$  the title of a different listing / $50</h5>
                  <h5>$  some other listing with a short description/ $100</h5>
                </div>
                <div>my pending offers</div>
                <div className='scroll-container'>
                  <h5>$  the title of a different listing / $50</h5>
                  <h5>$  some other listing with a short description/ $100</h5>
                </div>
                <div>my closed deals</div>
                <div className='scroll-container'>
                  <h5>$  title of some listing / $250</h5>
                  <h5>$  the title of a different listing / $50</h5>
                  <h5>$  some other listing with a short description/ $100</h5>
                  <h5>$  hopefully i can figure out how to open these from here / $20</h5>
                  <h5>$  title of some listing / $250</h5>
                  <h5>$  title of some listing / $250</h5>
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