import { observer } from 'mobx-react-lite'
import { useContext, useEffect, useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import Tooltip from '../components/Tooltip'
import { Button } from '../components/ui/button'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { cn } from '@/utils/cn'
import { formatTime } from '@/utils/time'
import { InfoIcon, Loader2, Pencil, User2 } from 'lucide-react'
import User from '../contexts/User'
import Interface from '../contexts/interface'

export default observer(() => {
  const user = useContext(User)
  const ui = useContext(Interface)
  const navigate = useNavigate()

  const [remainingTime, setRemainingTime] = useState<string>('')
  const [isSigningUp, setIsSigningUp] = useState(false);

  const handleSignup = async () => {
    setIsSigningUp(true);
    await user.signup();
    setIsSigningUp(false);
  }

  const updateTimer = () => {
    if (!user.userState) { // why is this attached to user state?
      setRemainingTime('')
      return
    }
    const time = user.userState.sync.calcEpochRemainingTime()
    const formattedTime = formatTime(time)
    setRemainingTime(formattedTime)
  }

  useEffect(() => {
    const intervalId = setInterval(() => {
      updateTimer()
    }, 1000)
    return () => clearInterval(intervalId)
  }, [])

  const notify = () => toast.warning("You're not a member yet. Please click JOIN to participate.");

  return (
    <>
      <header className='p-4 flex justify-between border-b-2 border-b-muted'>
        <div className={`${ui.isMobile ? null : 'flex'}`}>
          <div className="md:flex md:gap-x-3">
            <Link to="/" className="text-4xl md:text-5xl tracking-tight text-primary" style={{ 'fontFamily': 'Times New Roman' }}>
              trustlist
            </Link>
            <div className="bg-secondary p-2 rounded-sm border border-foreground/[.33]">
              <div className='flex items-center gap-2'>
                <p>
                  epoch #{user.userState?.sync.calcCurrentEpoch()}
                </p>
                <Tooltip
                  text='Trustlist epochs are 3 weeks long. Listings and their related offers and deals will expire at the close of each epoch. Members must transition to the new epoch in order to participate.'
                  content={
                    <InfoIcon size={16} className='text-primary' />
                  }
                />
              </div>
              <p>— ends in {remainingTime}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse md:flex-row gap-2">
          <Button
            onClick={() => user.hasSignedUp ? navigate('/dashboard') : notify()}
            variant={'outline'}
            className='border border-primary'
          >
            <User2 className='text-primary' size={16} />
            Dashboard
          </Button>

          <Button
            onClick={() => user.hasSignedUp ? navigate('/listings/new') : notify()}
            variant={'outline'}
            className='border border-primary'
          >
            <Pencil className='text-primary' size={16} />
            Add a listing
          </Button>

          <Button
            onClick={() => user.hasSignedUp ? null : handleSignup()}
            className={cn('uppercase text-xs bg-blue-50 text-indigo-700 font-semibold border-2 border-indigo-600 hover:bg-indigo-700 hover:text-indigo-50', user.hasSignedUp && 'rounded-full border border-indigo-300 disabled:opacity-90 disabled:cursor-not-allowed')}
            disabled={user.hasSignedUp || isSigningUp}
          >
            {isSigningUp ? (<span className='animate-spin mr-2'><Loader2 size={16} /></span>) : null}
            {user.hasSignedUp && (<div className="h-2 w-2 rounded-full bg-green-600 mr-2"></div>)}
            {user.hasSignedUp ? 'connected' : isSigningUp ? 'Joining...' : 'JOIN'}
          </Button>
        </div>
      </header>

      {!user.hasSignedUp && <ToastContainer className='header-toast' toastClassName='toast' position='top-right' autoClose={4000} />}
      <Outlet />
    </>
  )
})
