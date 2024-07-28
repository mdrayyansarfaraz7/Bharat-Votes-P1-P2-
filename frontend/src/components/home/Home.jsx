import { Link } from "react-router-dom"
import State from "../State/State"

function Home(){
    return(
        <>
        
        <div className="hero-section">
      <div className="text">
      <h1>Your Vote, Your Voice: "Shape the Future of Our Nation"</h1>
      </div>
      </div>
      <div className="Navigation">
        <div className="navItem">
        <h1 className='header'>How to Cast Your Vote</h1>
          <img src={`/CastVote.png`} alt="" />
          <Link to={'/HowToVote'}>
          <button>How to Vote</button>
          </Link>
          
        </div>
        <div className="navItem">
      <h1 className='header'>Voter Registration</h1>
          <img src={`/Register.png`} alt="" />
          <Link to={'/Register'}>
          <button>Register</button>
          </Link>
        </div>
        <div className="navItem">
      <h1 className='header'>Voting Schedule</h1>
          <img src={`/Schedule.png`} alt="" />
          <Link to={'/Schedule'}>
          <button>Check Dates</button>
          </Link>
        </div>
      </div>
        <State/>
        </>
    )
}

export default Home