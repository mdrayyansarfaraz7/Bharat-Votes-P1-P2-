import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import './Party.css'; 

function Party() {
  const [parties, setParties] = useState([]);
  const { state, district, name } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`http://localhost:3000/parties/${state}`)
      .then((res) => {
        console.log('API response:', res.data);
        if (Array.isArray(res.data)) {
          setParties(res.data);
        } else {
          console.error('Expected array but got:', res.data);
        }
      })
      .catch((err) => {
        console.error('API error:', err);
      });
  }, [state]);

  const handleVote = (partyName) => {
    axios.post(`http://localhost:3000/vote/${district}/${name}`, { party: partyName })
      .then((res) => {
        console.log('Vote submitted:', res.data);
        alert('You Have Successfully Voted!');
        navigate('/');
      })
      .catch((err) => {
        console.error('Vote submission error:', err);
      });
  };

  return (
    <div className="party-container">
      <h1>Cast Your Vote</h1>

      {parties.length > 0 && parties.map((party) => (
        <div key={party._id} className="party-card">
          <h2>{party.party}</h2>
          <img src={party.URL} alt={party.party} />
          <button onClick={() => handleVote(party.party)}>Vote</button>
        </div>
      ))}
    </div>
  );
}

export default Party;
