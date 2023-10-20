import React from 'react'
import { Outlet, Link } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import MemberDashboardModal from '../components/MemberDashboardModal'
// import NewListingModal from '../components/NewListingModal'
import Button from '../components/Button'
import Tooltip from '../components/Tooltip'
import './header.css'
import { User2 } from 'lucide-react'
import { Pencil } from 'lucide-react'
import { PenSquare } from 'lucide-react';

import User from '../contexts/User'
import Interface from '../contexts/interface'

export default observer(() => {
    const user = React.useContext(User)
    const ui = React.useContext(Interface)

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
        if (showMemberDash || showNewListing) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'auto'
        }
    }, [showMemberDash, showNewListing])

    const date = new Date()
    date.setSeconds(date.getSeconds() + remainingTime)
    const dateString = `${date.toDateString().slice(4)}  @  ${date.getHours()}:${date.getMinutes()}`

    return (
        <>
            {!ui.isMobile ? (
                <div className="header">
                    <div className="app-title">
                        <Link to="/">trustlist</Link>
                    </div>

                    <div className="epoch-info">
                        <div className='flex items-center gap-2'>
                          <div>
                            epoch: {user.userState?.sync.calcCurrentEpoch()}
                          </div>
                          <Tooltip
                              text='Trustlist epochs are 7 days long. Listings and their related offers and deals will expire at the close of each epoch. Members must transition to the new epoch in order to participate.'
                              content={
                                  <img
                                      src={require('../../public/info_icon.svg')}
                                      alt="info icon"
                                  />
                              }
                          />
                        </div>
                        <div>
                            ending:{' '}
                            <span>{dateString}</span>
                        </div>
                    </div>

                    <div className="actions">
                        <div className="action-item">
                            {!user.hasSignedUp ? (
                                <Button onClick={() => user.signup()}>
                                    JOIN
                                </Button>
                            ) : (
                                <div>
                                    <Button>connected</Button>
                                </div>
                            )}
                        </div>
                        <div className="action-item">
                            {user.hasSignedUp ? (
                                <>
                                    <button
                                        onClick={() => setShowMemberDash(true)}
                                        className='px-3 py-1 font-semibold flex items-center gap-1'
                                    >
                                        <User2 color='blue'/>
                                        <div>
                                          <div>member</div>
                                          <div>dashboard</div>
                                        </div>
                                    </button>
                                    {showMemberDash && (
                                        <MemberDashboardModal
                                            setShowMemberDash={
                                                setShowMemberDash
                                            }
                                        />
                                    )}
                                </>
                            ) : (
                                <button style={{ cursor: 'not-allowed' }}>
                                    <span style={{ fontSize: '0.6rem' }}>
                                        👤
                                    </span>{' '}
                                    my TL
                                </button>
                            )}
                        </div>
                        <div className="action-item">
                            {user.hasSignedUp &&
                                <Link to={'/listings/new'}>
                                    <button className='px-3 py-1 font-semibold flex items-center gap-1'>
                                      <Pencil color='blue'/>
                                      <div>
                                        <div>create</div>
                                        <div>listing</div>
                                      </div>
                                    </button>
                                </Link>
                            }
                        </div>
                    </div>
                </div>
            ) : (
                <div className="header">
                    <div>
                        <div className="app-title">
                            <Link to="/">trustlist</Link>
                        </div>
                        <div className="epoch-info">
                            <div className='flex items-center gap-2'>
                              <div>
                                epoch: {user.userState?.sync.calcCurrentEpoch()}
                              </div>
                              <Tooltip
                                  text='Trustlist epochs are 7 days long. Listings and their related offers and deals will expire at the close of each epoch. Members must transition to the new epoch in order to participate.'
                                  content={
                                      <img
                                          src={require('../../public/info_icon.svg')}
                                          alt="info icon"
                                      />
                                  }
                              />
                            </div>
                            <div>ending:</div>
                            <div>{dateString}</div>
                        </div>
                    </div>

                    <div className="header-buttons">
                        {!user.hasSignedUp ? (
                            <Button  style={{width: '100%'}} onClick={() => user.signup()}>JOIN</Button>
                        ) : (
                            <div>
                                <Button style={{width: '100%'}}>connected</Button>
                            </div>
                        )}
                        <div className="actions">
                            {user.hasSignedUp ? (
                                <>
                                    <button
                                        onClick={() => setShowMemberDash(true)}
                                        className='px-3 py-1 font-semibold flex items-center gap-1 w-full'
                                    >
                                        <User2 color='blue'/>
                                        <div>
                                          <div>member</div>
                                          <div>dashboard</div>
                                        </div>
                                    </button>
                                    {showMemberDash && (
                                        <MemberDashboardModal
                                            setShowMemberDash={
                                                setShowMemberDash
                                            }
                                        />
                                    )}
                                </>
                            ) : (
                                <button>👤</button>
                            )}
                            <div >
                                {user.hasSignedUp &&
                                    <Link to={'/listings/new'}>
                                      <button className='px-3 py-2 font-semibold flex items-center gap-1 w-full'>
                                        <Pencil color='blue'/>
                                        <div>create lsiting</div>
                                      </button>
                                    </Link>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Outlet />
        </>
    )
})
