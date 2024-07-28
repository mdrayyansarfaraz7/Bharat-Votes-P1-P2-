const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const cors = require('cors'); // Include CORS for development if needed
const StateAndDistrict = require('./models/StateAndDestrict');
const Voter = require('./models/Voters');
const Party = require('./models/Parties');
const StatesAndParty = require('./models/StateAndParties');
const crypto = require('crypto');
const nodemailer = require("nodemailer");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Enable CORS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Database connection
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/RemoteVoting');
}

main().then(() => console.log("DB Connected!")).catch(err => console.log("DB Connection Error:", err));

const port = 3000;


// Register route
app.get('/register', (req, res) => {
    res.render('register');
});


app.post('/register', async (req, res) => {
    const {
        voterName,
        dob,
        gender,
        homeState,
        homeDistrict,
        currentState,
        currentCountry,
        aadharNumber,
        voterID,
        email,  // email is optional now
        contactNumber
    } = req.body;

    console.log(req.body);

    // Basic validation
    const aadharPattern = /^\d{12}$/;
    const voterIdPattern = /^[a-zA-Z0-9]{10}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!voterName || !dob || !gender || !homeState || !homeDistrict || !currentState || !currentCountry || !aadharNumber || !voterID || !contactNumber) {
        return res.status(400).send('All fields except required');
    }

    // if (!aadharPattern.test(aadharNumber)) {
    //     return res.status(400).send('Invalid Aadhar number');
    // }

    if (!voterIdPattern.test(voterID)) {
        return res.status(400).send('Invalid Voter ID');
    }

    if (email && !emailPattern.test(email)) {
        return res.status(400).send('Invalid email address');
    }

    const saltRounds = 10;
    try {
        const hashedVoterId = await bcrypt.hash(voterID, saltRounds);
        const hashedAadhar = await bcrypt.hash(aadharNumber, saltRounds);

        let state = await StateAndDistrict.findOne({ state: homeState });
        if (!state) {
            return res.status(404).send('State not found');
        }

        let district = state.districts.find(district => district.name === homeDistrict);
        if (!district) {
            return res.status(404).send('District not found');
        }

        district.noOfVoters += 1;
        await state.save();

        const voter = new Voter({
            voterName,
            dob,
            gender,
            homeState: state._id,
            homeDistrict,
            currentState,
            currentCountry,
            aadharNumber: hashedAadhar,
            voterId: hashedVoterId,
            email,
            contactNumber,
            vote: { iv: '', voteTo: '' },
            token: { value: '', status: 'active' }
        });

        await voter.save();
        res.status(201).send(voter);
    } catch (error) {
        if (error.code === 11000) {
            if (error.keyPattern.aadharNumber) {
                return res.status(400).send('Aadhar number already exists');
            } else if (error.keyPattern.voterId) {
                return res.status(400).send('Voter ID already exists');
            }
        }
        console.error('Error registering the voter:', error);
        res.status(500).send('Internal server error');
    }
});

// States route
app.get('/states', async (req, res) => {
    try {
        let India = await StateAndDistrict.find({});
        console.log(India);
        res.json(India);
    } catch (error) {
        console.error('Error fetching states:', error);
        res.status(500).send('Internal server error');
    }
});

app.get('/parties/:state', async (req, res) => {
    let { state } = req.params;

    try {
        // Perform the aggregation to get the party details
        let allParties = await StatesAndParty.aggregate([
            { $match: { state: state } }, // Match the state
            {
                $lookup: {
                    from: 'parties', // The collection to join
                    localField: 'parties', // Field from the input documents
                    foreignField: '_id', // Field from the documents of the "from" collection
                    as: 'partyDetails' // Output array field
                }
            },
            {
                $project: {
                    _id: 0, // Exclude the _id field if not needed
                    state: 1,
                    'partyDetails.party': 1, // Include the party name
                    'partyDetails.URL': 1 // Include the party URL
                }
            }
        ]);

        res.send(allParties[0].partyDetails);
    } catch (error) {
        console.error('Error fetching party details:', error);
        res.status(500).send('Internal server error');
    }
});

app.get('/voters/:state/:district',async(req,res)=>{
    let{state,district}=req.params;
    let allVoters=await Voter.find({homeDistrict:district});
    res.send(allVoters);
})

// Parties route
app.get('/parties', async (req, res) => {
    try {
        const result = await Party.find({});
        console.log(result);
        res.json(result);
    } catch (error) {
        console.error('Error fetching parties:', error);
        res.status(500).send('Internal server error');
    }
});

app.get('/StateParties',async (req,res)=>{
    const result=await StatesAndParty.find({});
    res.send(result);
})


app.get('/State/:state',async(req,res)=>{
    let {state}=req.params;
    let result=await StateAndDistrict.find({state:state});
    res.send(result[0].districts);
});

app.post('/verify/:state/:district', async (req, res) => {
    const { state, district } = req.params;
    const { name, voterId } = req.body;
  
    try {
      
      const voter = await Voter.findOne({ voterName:name, homeDistrict:district });
        console.log(voter);
      if (!voter) {
        return res.status(404).send('Voter not found');
      }
      if(voter.token.status==='destroyed'){
        return res.status(404).send('Voter already Voted!');
      }

      const isMatch = await bcrypt.compare(voterId, voter.voterId);
  
      if (!isMatch) {
        return res.status(401).send('Invalid Voter ID');
      }
      const token = crypto.randomBytes(16).toString('hex');
      voter.token.value = token;
      voter.token.status = 'active';
      await voter.save();

      res.send({ message: 'Verification successful',token});
      const transport = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'queenie22@ethereal.email',
            pass: 'B1TAzc79aBvJgEJmWy'
        }
    });
    
    const info = await transport.sendMail({
        from: '"Election Commission Of India " <queenie22@ethereal.email>', 
        to: voter.email, 
        subject: "Election Commission of India:Voter Verification", 
        text: `YOUR OTP:${token}`, 
      });
      console.log(info);
    } catch (error) {
      console.error('Error verifying voter:', error);
      res.status(500).send('Internal server error');
    }
    
  });

  app.post('/vote/:district/:name', async (req, res) => {
    const { district, name } = req.params;
    const { party } = req.body;

    console.log(`Received vote for party: ${party} from district: ${district}, voter: ${name}`);
    const algorithm = 'aes-256-cbc';
    const key = crypto.randomBytes(32);  // 256-bit key for AES-256
    const iv = crypto.randomBytes(16);

    let cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(party, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const ivHex = iv.toString('hex');
    const keyHex = key.toString('hex');  // Convert key to hex string

    console.log("IV:", ivHex, "Encrypted Vote:", encrypted);
    const voter = await Voter.findOne({ voterName: name, homeDistrict: district });
    console.log(voter);

    if (!voter) {
        return res.status(404).send('Voter not found');
    }
    
    voter.vote.iv = ivHex;
    voter.vote.voteTo = encrypted;
    voter.vote.key = keyHex;  // Store key as hex string
    voter.token.value = '';
    voter.token.status = 'destroyed';
    await voter.save();

    res.status(200).send({ message: 'Vote submitted successfully' });
    const transport = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'queenie22@ethereal.email',
            pass: 'B1TAzc79aBvJgEJmWy'
        }
    });
    
    const info = await transport.sendMail({
        from: '"Election Commission Of India " <queenie22@ethereal.email>', 
        to: voter.email, 
        subject: "Election Commission of India:Vote Verification", 
        text: "You have Successfully Casted Your Vote", 
      });
      console.log(info);
});



app.listen(port, () => {
    console.log(`Listening on PORT: ${port}`);
});
