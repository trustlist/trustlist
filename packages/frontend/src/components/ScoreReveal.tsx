import { observer } from 'mobx-react-lite'
import './newListingModal.css'

type Props = {
    hidden: boolean
}

export default observer(({ hidden }: Props) => {
    return (
        <>
            {hidden ? (
                <div className="choose">
                    <img
                        src={require('../../public/eye_open.svg')}
                        alt="eye open"
                    />
                </div>
            ) : (
                <div className="choose reveal">
                    <img
                        src={require('../../public/eye_open.svg')}
                        alt="eye open"
                    />
                </div>
            )}
        </>
    )
})
