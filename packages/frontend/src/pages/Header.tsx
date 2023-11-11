import { observer } from 'mobx-react-lite'
import { useContext, useEffect, useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '../components/ui/button'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { cn } from '@/utils/cn'
import { formatTime } from '@/utils/time'
import { InfoIcon, Dot, Loader2, Pencil, User2 } from 'lucide-react'
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
      <header className='p-4 md:p-6 flex justify-between items-end'>
        <div className={`${ui.isMobile ? null : 'flex'}`}>
          <div className="md:flex md:gap-x-8 items-end">
            <div className='flex gap-3'>
              <Link to="/" className="text-5xl md:text-5xl/10 tracking-tight text-primary" style={{ 'fontFamily': 'Times New Roman' }}>
                trustlist
              </Link>

              <Dialog >
                <DialogTrigger title='Learn how trustlist works'>
                  <InfoIcon size={28} className='text-primary' />
                </DialogTrigger>
                <DialogContent>
                  <h4 className='text-xl font-semibold'>What is Trustlist?</h4>
                  <p className='text-[11px]'>
                    Trustlist operates similarly to the original Craigslist: members list, find, connect, 
                    and execute transactions independently. However, it enhances the model of the peer-to-peer 
                    marketplaces by embedding a dynamic reputation system, aiming to cultivate a community 
                    brimming with trust - a stark contrast to the often dubious nature of anonymous listings. 
                    When offline transactions are complete, both parties revisit their deal to provide 
                    attestations, which build the member's reputation and infuse confidence in the community.
                  </p>
                  <p className='text-[11px]'>
                    New users can sign up by clicking the JOIN button at the top right corner of the screen. 
                    Members of Trustlist are given 3 anonymous identifiers (epoch keys) to use while interacting 
                    with the application. Using UniRep Protocol's zero-knowledge technology under the hood, Trustlist 
                    epoch keys ensure that users remain anonymous while accumulating reputational data.
                  </p>
                  <p className='text-[11px]'>
                    Trustlist begins a new cycle (epoch) every 3 weeks, and current listings will expire with each 
                    epoch. Members must complete their transactions and return to submit their reviews before the epoch 
                    ends in order to have their reputation scores updated with the data associated to that 
                    transaction. Each new epoch provides members with 3 fresh epoch keys to support continued anonymity.
                  </p>
                  <p className='text-[11px]'>
                    When creating a listing or an offer, members can choose whether to reveal or hide their scores for each 
                    of 4 reputation metrics. These scores become part of each listing or offer, providing others with information 
                    that allows them to make informed decisions on whom they engage with. More info on Trustscores can be found 
                    in the member's Dashboard.  
                  </p>
                  <div className='flex justify-around'>
                    <a href='https://www.notion.so/pse-team/Trustlist-FAQ-10099c372b8b4725b276880b828a48d3' target='blank'>FAQ</a>
                    <a href='https://discord.gg/UmS33GXkD2' target='blank'>UniRep Discord</a>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="bg-[#F6F4F4] p-2 rounded-sm border border-indigo-500 mt-3 md-mt-0 md:flex">
              <p className='self-center'>epoch #{user.userState?.sync.calcCurrentEpoch()}</p>
              {!ui.isMobile ? <Dot color='blue'/> : null}
              <div className='flex items-center gap-2'>
                <p>ends in {remainingTime}</p>
              </div>
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
