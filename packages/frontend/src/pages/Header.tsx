import React from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import MemberDashboardModal from '../components/MemberDashboardModal'
// import NewListingModal from '../components/NewListingModal'
import Button from '../components/Button'
import Tooltip from '../components/Tooltip'
import './header.css'
import { User2 } from 'lucide-react'
import { Pencil } from 'lucide-react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import User from '../contexts/User'
import Interface from '../contexts/interface'

export default observer(() => {
    const user = React.useContext(User)
    const ui = React.useContext(Interface)
    const navigate = useNavigate()

    const [remainingTime, setRemainingTime] = React.useState<number>(0)
    // const [showNewListing, setShowNewListing] = React.useState<boolean>(false)
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
        if (showMemberDash) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'auto'
        }
    }, [showMemberDash])

    const date = new Date()
    date.setSeconds(date.getSeconds() + remainingTime)
    const minutes = date.getMinutes()
    const dateString = `${date
        .toDateString()
        .slice(4)}  @  ${date.getHours()}:${minutes < 10 ? 0 : ''}${minutes}`

    const notify = () =>
        toast.warning(
            "You're not a member yet. Please click JOIN to participate."
        )

    return (
        <>
            <div className="header">
                <div className={`${ui.isMobile ? null : 'flex'}`}>
                    <div className="app-title">
                        <Link to="/">trustlist</Link>
                    </div>

                    <div className="epoch-info">
                        <div className="flex items-center gap-2">
                            <div>
                                epoch: {user.userState?.sync.calcCurrentEpoch()}
                            </div>
                            <Tooltip
                                text="Trustlist epochs are 7 days long. Listings and their related offers and deals will expire at the close of each epoch. Members must transition to the new epoch in order to participate."
                                content={
                                    <img
                                        src={require('../../public/info_icon.svg')}
                                        alt="info icon"
                                    />
                                }
                            />
                        </div>
                        <div className={`${ui.isMobile ? null : 'flex'}`}>
                            <div>ending: </div>
                            <div>{dateString}</div>
                        </div>
                    </div>
                </div>

                <div className="actions">
                    <Button
                        onClick={() =>
                            user.hasSignedUp ? null : user.signup()
                        }
                        loadingText="joining..."
                    >
                        {user.hasSignedUp ? 'connected' : 'JOIN'}
                    </Button>

                    <button
                        onClick={() =>
                            user.hasSignedUp
                                ? setShowMemberDash(true)
                                : notify()
                        }
                        className="px-3 py-1 font-semibold flex justify-center items-center gap-1 text-sm"
                    >
                        <User2 color="blue" />
                        <div>
                            <div>member</div>
                            <div>dashboard</div>
                        </div>
                    </button>
                    {showMemberDash && (
                        <MemberDashboardModal
                            setShowMemberDash={setShowMemberDash}
                        />
                    )}

                    <button
                        onClick={() =>
                            user.hasSignedUp
                                ? navigate('/listings/new')
                                : notify()
                        }
                        className="px-3 py-1 font-semibold flex justify-center items-center gap-2 text-sm"
                    >
                        <Pencil color="blue" />
                        <div>
                            <div>create</div>
                            <div>listing</div>
                        </div>
                    </button>
                </div>
            </div>

            {!user.hasSignedUp && (
                <ToastContainer
                    className="header-toast"
                    toastClassName="toast"
                    position="top-right"
                    autoClose={4000}
                />
            )}
            <Outlet />
        </>
    )
})
