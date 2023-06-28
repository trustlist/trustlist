import { useContext, useState } from 'react'
import { useNavigate } from "react-router-dom"
import { observer } from 'mobx-react-lite'
import Button from './Button';
import Tooltip from './Tooltip';

import Trustlist from '../contexts/Trustlist';
import User from '../contexts/User';

type Props = {
  member: string;
  memberKeys: string[];
  currentMemberId: string;
  oppositeMemberId: string;
  posterAttested: boolean;
  responderAttested: boolean;
}

export default observer(({ 
  member, 
  memberKeys, 
  currentMemberId, 
  oppositeMemberId,
  posterAttested,
  responderAttested
}: Props) => {
  
  const app = useContext(Trustlist)
  const user = useContext(User)
  const navigate = useNavigate()
  const [sentiment, setSentiment] = useState(3)
  const [dealAgain, setDealAgain] = useState(1)
  const sentiments = ['hard no', 'not really', 'whatever idc', 'mostly', 'yeah def']

  return (
    <div className="attestation-form">
                <div className="icon">
                    <h2>{member}'s review</h2>
                    <Tooltip 
                      text="Your review of your experience with this member will become part of their trustlist reputation. Neither member will receive reputational data for this deal unless both parties sumbit their review before the epoch expires." 
                      content={<img src={require('../../public/info_icon.svg')} alt="info icon"/>}
                    />
                </div>
                <p>The member I interacted with in this deal was respectful, friendly, and easy to communicate with.</p>
                <div className='sentiments'>
                  {sentiments.map((sentiment) => (
                      <div>
                        <input 
                          type='radio' 
                          id={sentiment} 
                          name='sentiment' 
                          value={sentiment}
                          onChange={(e) => setSentiment(sentiments.indexOf(e.target.value) + 1)}
                        />
                        <label htmlFor={sentiment}></label>{sentiment}<br/>
                      </div>
                  ))}
                </div>
                <p>I would</p>
                <div style={{paddingLeft: '2rem'}}>
                  <input
                    type='radio' 
                    id='gladly' 
                    name='again' 
                    value='gladly'
                    onChange={(e) => setDealAgain(1)}
                  />
                  <label htmlFor='gladly'>GLADLY</label><br/>
                  <input
                    type='radio' 
                    id='never' 
                    name='again' 
                    value='never'
                    onChange={(e) => setDealAgain(0)}
                  />
                  <label htmlFor='gladly'>NEVER</label>
                </div>
                <p style={{paddingLeft: '5rem'}}>deal with this member again</p>
                
                <div style={{padding: '1rem'}}>
                  {memberKeys.includes(currentMemberId) ? (
                    <Button
                      // style={{backgroundColor: 'blue', color: 'white'}}
                      onClick={async () => {
                        if (
                            user.userState &&
                            user.userState.sync.calcCurrentEpoch() !==
                                (await user.userState.latestTransitionedEpoch())
                        ) {
                            throw new Error('Needs transition')
                        }
                        const index2 = (1 << 23) + dealAgain
                        const index3 = (5 << 23) + sentiment
                        // +1 to current member's completed CB score
                        await user.requestReputation(
                            {[1]:1},
                            memberKeys.indexOf(currentMemberId) ?? 0,
                            ''
                        )
                        // +1 to opposite member's expected and +1 || 0 to completed TD score
                        // +5 to opposite member's expected and +0-5 to completed GV score
                        await user.requestReputation(
                            {[2]:index2, [3]:index3},
                            memberKeys.indexOf(currentMemberId) ?? 0,
                            oppositeMemberId
                        )
                        navigate(`/`)
                      }}
                    >
                      Submit
                    </Button>
                  ) : null
                  // ) : <Button style={{cursor: 'not-allowed'}}>Submit</Button>
                  }
                  
                </div>
              </div>
  )
})