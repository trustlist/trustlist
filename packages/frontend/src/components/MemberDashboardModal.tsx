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
                  <div>
                    <h3>my latest trust scores:</h3>
                  </div>
                  {user.data.map((data, i) => {
                    return (
                      <div key={i} className="info-item">
                        {i < 4 ? (
                          <>
                            <div>Score {i + 1}</div>
                            <div className="stat">
                              {(data || 0).toString()}
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
                    return (
                      <div key={i} className="info-item">
                        {i < 4 ? (
                          <>
                            <div>Score {i + 1}</div>
                            <div className="stat">
                              {(data || 0).toString()}
                            </div>
                          </>
                        ) : null }
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className='activity-container'>
                <h4>awaiting my review</h4>
                <div className='scroll-container'>
                  <h5>$  title of some listing / $250</h5>
                  <h5>$  the title of a different listing / $50</h5>
                  
                </div> 
                <h4>my open listings</h4>
                <div className='scroll-container'>
                  <h5>$  the title of a different listing / $50</h5>
                  <h5>$  some other listing with a short description/ $100</h5>
                </div>
                <h4>my pending offers</h4>
                <div className='scroll-container'>
                  <h5>$  the title of a different listing / $50</h5>
                  <h5>$  some other listing with a short description/ $100</h5>
                  <h5>$  some other listing with a short description/ $100</h5>
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