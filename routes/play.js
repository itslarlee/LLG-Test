const express = require('express');
const LLGABI = require('../contracts/LLGContractABI.json');
const Web3 = require('web3');

const router = express.Router();


const web3 = new Web3('https://bsc-dataseed1.binance.org/');

const contractAddress = '0x4691f60c894d3f16047824004420542e4674e621';
const llgContract = new web3.eth.Contract(LLGABI, contractAddress);

router.get('/', (req, res) => {
    res.render('partials/play', {
        title: 'Chess Hub - Game',
        user: req.user,
        isPlayPage: true
    });
});


router.get('/balance/:account', async (req, res) => {
    const { account } = req.params;

    if (!web3.utils.isAddress(account)) {
        return res.status(400).json({ success: false, message: "Invalid Ethereum address" });
    }

    try {
        const balance = await llgContract.methods.balanceOf(account).call();
        res.json({ success: true, balance: balance });
    } catch (err) {
        console.error('Error retrieving balance:', err);
        res.status(500).json({ success: false, message: "Failed to retrieve balance", error: err.message });
    }
});


router.post('/transfer', async (req, res) => {
    const { from, to, amount } = req.body;

    if (!from || !to || !amount) {
        return res.status(400).json({ success: false, message: "From, to, and amount fields are required" });
    }

    const transactionOptions = {
        from: from,
        gas: 500000,
        gasPrice: '20000000000'
    };

    try {
        const tx = await llgContract.methods.transfer(to, amount).send(transactionOptions);
        res.json({ success: true, transaction: tx });
    } catch (err) {
        console.error('Error during token transfer:', err);
        res.status(500).json({ success: false, message: "Failed to transfer tokens", error: err.message });
    }
});


module.exports = router;
