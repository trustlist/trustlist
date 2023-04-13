import React from 'react'
import { Outlet, Link } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import MemberDashboardModal from '../components/MemberDashboardModal';
import NewListingModal from '../components/NewListingModal';
import Button from '../components/Button'
import Tooltip from '../components/Tooltip';
import './header.css'

import User from '../contexts/User'

export default observer(() => {

  const user = React.useContext(User)

  const [remainingTime, setRemainingTime] = React.useState<number>(0)
  const [showNewListing, setShowNewListing] = React.useState<boolean>(false)
  const [showMemberDash, setShowMemberDash] = React.useState<boolean>(false)

  const updateTimer = () => {
    if (!user.userState) {
      setRemainingTime(0)
      return
    }
    const time = user.userState.sync.calcEpochRemainingTime()
    setRemainingTime(time)
  }

  React.useEffect(() => {
    setInterval(() => {
      updateTimer()
    }, 1000)
  }, [])

const hours = Math.floor(remainingTime / 3600);
const minutes = Math.floor((remainingTime - (hours * 3600)) / 60);
const seconds = remainingTime - (hours * 3600) - (minutes * 60);
const timeString = hours.toString().padStart(2, '0') + ':' + 
      minutes.toString().padStart(2, '0') + ':' + 
      seconds.toString().padStart(2, '0');

  return (
    <>
      <div className="header">
          <div style={{display: 'flex'}}>
            <div className='app-title'><Link to='/'>trustlist</Link></div>
            {/* <div className='app-title'><Link to='/'>zk<span style={{fontSize: '1.5rem', fontWeight: '200'}}>lassified</span></Link></div> */}
            {/* <Link to='/dashboard'><button>old dashboard</button></Link> */}
            {/* <Tooltip text='time until next epoch; all current listings will expire at the end of this epoch'></Tooltip> */}
            <div style={{paddingLeft: '2rem'}}>
              <div>epoch: {user.userState?.sync.calcCurrentEpoch()}</div>
              <div>next epoch in: <span style={{color: 'red'}}>{timeString}</span></div>
            </div>          
          </div>

          <div className='actions'>
            <div className='action-item'>
                {!user.hasSignedUp ? (
                    <Button onClick={() => user.signup()}>JOIN</Button>
                ) : (
                    <div>
                        <Button>connected</Button>
                    </div>
                )}
            </div>
            <div className='action-item'>
                {user.hasSignedUp ? (
                    <>
                      <button onClick={()=> setShowMemberDash(true)}>my TL</button>
                      {showMemberDash && <MemberDashboardModal setShowMemberDash={setShowMemberDash}/>}
                    </>
                ) : (
                      <button style={{cursor: 'not-allowed'}}>my TL</button>
                )} 
            </div>
            <div className='action-item'>
                {user.hasSignedUp ? (
                  <>
                    <button onClick={()=> setShowNewListing(true)}>list 🖌️</button>
                    {showNewListing && <NewListingModal setShowNewListing={setShowNewListing}/>}
                  </>
                ) : (
                  <button style={{cursor: 'not-allowed'}}>list 🖌️</button>
                )}
            </div>
          </div>
      </div>

      <Outlet />
    </>
  )
})
