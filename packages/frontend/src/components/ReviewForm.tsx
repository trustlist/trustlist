import { useContext, useState } from 'react'
import { observer } from 'mobx-react-lite'
import Button from './Button'
import Tooltip from './Tooltip'

import Trustlist from '../contexts/Trustlist'
import User from '../contexts/User'

type Props = {
    dealId: string
    member: string
    memberKeys: string[]
    currentMemberId: string
    oppositeMemberId: string
    currentMemberReview: string
    oppositeMemberReview: string
}

export default observer(
    ({
        dealId,
        member,
        memberKeys,
        currentMemberId,
        oppositeMemberId,
        currentMemberReview,
        oppositeMemberReview,
    }: Props) => {
        const app = useContext(Trustlist)
        const user = useContext(User)
        const [sentiment, setSentiment] = useState(0)
        const [dealAgain, setDealAgain] = useState(1)
        const sentiments = [
            'hard no',
            'not really',
            'whatever idc',
            'mostly',
            'yeah def',
        ]

        return (
            <div className="attestation-form">
                <div className="icon">
                    <h2>{member}'s review</h2>
                    <Tooltip
                        text="Your review of your experience with this member will become part of their trustlist reputation. Neither member will receive reputational data for this deal unless both parties sumbit their review before the epoch expires."
                        content={
                            <img
                                src={require('../../public/info_icon.svg')}
                                alt="info icon"
                            />
                        }
                    />
                </div>
                {currentMemberReview ? (
                    <div style={{ fontSize: '0.8rem' }}>
                        ✅ review submitted
                    </div>
                ) : (
                    <>
                        <div style={{ fontSize: '0.8rem' }}>
                            ❗️awaiting submission
                        </div>
                        <hr style={{ marginBottom: '1.5rem' }} />
                        <p>
                            The member I interacted with in this deal was
                            respectful, friendly, and easy to communicate with.
                        </p>
                        <div className="sentiments">
                            {sentiments.map((sentiment) => (
                                <div>
                                    <input
                                        type="radio"
                                        id={sentiment}
                                        name="sentiment"
                                        value={sentiment}
                                        onChange={(e) =>
                                            setSentiment(
                                                sentiments.indexOf(
                                                    e.target.value
                                                ) + 1
                                            )
                                        }
                                    />
                                    <label htmlFor={sentiment}></label>
                                    {sentiment}
                                    <br />
                                </div>
                            ))}
                        </div>
                        <p>I would</p>
                        <div style={{ paddingLeft: '2rem' }}>
                            <input
                                type="radio"
                                id="gladly"
                                name="again"
                                value="gladly"
                                onChange={(e) => setDealAgain(1)}
                            />
                            <label htmlFor="gladly">GLADLY</label>
                            <br />
                            <input
                                type="radio"
                                id="never"
                                name="again"
                                value="never"
                                onChange={(e) => setDealAgain(0)}
                            />
                            <label htmlFor="gladly">NEVER</label>
                        </div>
                        <p style={{ paddingLeft: '5rem' }}>
                            deal with this member again
                        </p>

                        <div style={{ padding: '1rem' }}>
                            {memberKeys.includes(currentMemberId) &&
                            !currentMemberReview ? (
                                <Button
                                    onClick={async () => {
                                        if (!sentiment) {
                                            window.alert(
                                                'please provide a value for your review.'
                                            )
                                            return
                                        }
                                        // +1 to current member's completed CB score
                                        await user.requestData(
                                            { [2]: 1 },
                                            memberKeys.indexOf(
                                                currentMemberId
                                            ) ?? 0,
                                            ''
                                        )
                                        // +1 to opposite member's expected and +1 || 0 to completed TD score
                                        // +5 to opposite member's expected and +0-5 to completed GV score
                                        const TDscore = (1 << 23) + dealAgain
                                        const GVscore = (5 << 23) + sentiment
                                        if (oppositeMemberReview) {
                                            await user.requestData(
                                                { [2]: TDscore, [3]: GVscore },
                                                memberKeys.indexOf(
                                                    currentMemberId
                                                ) ?? 0,
                                                oppositeMemberId
                                            )
                                            await user.requestData(
                                                JSON.parse(
                                                    oppositeMemberReview
                                                ),
                                                memberKeys.indexOf(
                                                    currentMemberId
                                                ) ?? 0,
                                                ''
                                            )
                                        }
                                        const review = JSON.stringify({
                                            [2]: TDscore,
                                            [3]: GVscore,
                                        })
                                        const message = await app.submitReview(
                                            dealId,
                                            member,
                                            review
                                        )
                                        window.alert(message)
                                        window.location.reload()
                                    }}
                                >
                                    Submit
                                </Button>
                            ) : null}
                        </div>
                    </>
                )}
            </div>
        )
    }
)
