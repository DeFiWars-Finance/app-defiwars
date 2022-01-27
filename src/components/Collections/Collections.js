import React from "react";
import style from "./Collections.css";
import appStyle from "../../App.module.css";
import Footer from "../Footer/Footer";
import Header from "../Header/Header";
import Store from "../../store/store";
import Select from 'react-styled-select'

const store = Store.store;
const emitter = Store.emitter;

class Collections extends React.Component {
  constructor(props) {
    super(props);
    const accountAddress = store.getStore("accountAddress");
    const haveNFT = store.getStore("haveNFT");
    const isInWar = store.getStore("isInWar");
    const darthLP = store.getStore("darthLP");
    const jediLP = store.getStore("jediLP");
    const staked = store.getStore("staked");
    const NFTs = store.getStore("NFTs");
    const stakedDarth = store.getStore("stakedDarth");
    const stakedJedi = store.getStore("stakedJedi");
    const canClaim = store.getStore("canClaim");

    this.state = {
      accountAddress: accountAddress,
      haveNFT: haveNFT,
      isInWar: isInWar,
      jediLP: jediLP,
      darthLP: darthLP,
      staked: staked,
      NFTs: NFTs,
      stakedDarth: stakedDarth,
      stakedJedi: stakedJedi,
      canClaim: canClaim,
      jedivalue: 1,
      darthvalue: 1,
      };

    this.balances = this.balances.bind(this);
    this.jedihandleChange = this.jedihandleChange.bind(this);
    this.darthhandleChange = this.darthhandleChange.bind(this);
    this.setstaked = this.setstaked.bind(this);
    this.stakeJedi = this.stakeJedi.bind(this);
    this.stakeDarth = this.stakeDarth.bind(this);  
    }
  
  balances() {
    const accountAddress = store.getStore("accountAddress");
    const haveNFT = store.getStore("haveNFT");
    const isInWar = store.getStore("isInWar");
    const darthLP = store.getStore("darthLP");
    const jediLP = store.getStore("jediLP");
    const NFTs = store.getStore("NFTs");
    
    this.setState({
      accountAddress: accountAddress,
      haveNFT: haveNFT,
      isInWar: isInWar,
      darthLP: darthLP,
      jediLP: jediLP,
      NFTs: NFTs,
      })
    }
  
  async stakeJedi() {
    store.setReady(true);
    const accountAddress = store.getStore("accountAddress");
    const dwarfAddress = store.getStore("dwarfAddress");
    const dwarfABI = store.getStore("dwarfABI");
    const erc20ABI = store.getStore("erc20ABI");
    const lpJediAddress = store.getStore("lpJediAddress");
    const web3 = store.getStore("web3");
    const dwarfContract = new web3.eth.Contract(dwarfABI, dwarfAddress);
    let jediContract = new web3.eth.Contract(erc20ABI, lpJediAddress);
    var allowance = await jediContract.methods.allowance(accountAddress, dwarfAddress).call({ from:accountAddress, });
    const ethAllowance = parseFloat(allowance)/10**18;
    if(parseFloat(ethAllowance) < 3000) {
      await jediContract.methods.approve(dwarfAddress, web3.utils.toWei("999999999999999", "ether")).send({ from:accountAddress, })
      }
      console.log(this.state.jedivalue);
      try {
        var result = await dwarfContract.methods.stakeJedi(this.state.jedivalue).send({ from:accountAddress, });
        console.log(result);
        }
        catch(error) {
          store.setReady(false);
          console.log(error);
          }
    store.setReady(false);
    store.checkMarket();
    }

  async stakeDarth() {
    store.setReady(true);
    const accountAddress = store.getStore("accountAddress");
    const dwarfAddress = store.getStore("dwarfAddress");
    const dwarfABI = store.getStore("dwarfABI");
    const web3 = store.getStore("web3");
    const dwarfContract = new web3.eth.Contract(dwarfABI, dwarfAddress);
    const erc20ABI = store.getStore("erc20ABI");
    const lpDarthAddress = store.getStore("lpDarthAddress");
    let darthContract = new web3.eth.Contract(erc20ABI, lpDarthAddress);
    var allowance = await darthContract.methods.allowance(accountAddress, dwarfAddress).call({ from:accountAddress, });
    const ethAllowance = parseFloat(allowance)/10**18;
      if(parseFloat(ethAllowance) < 3000) {
        await darthContract.methods.approve(dwarfAddress, web3.utils.toWei("999999999999999", "ether")).send({ from:accountAddress, });
        }
        console.log(this.state.darthvalue);
        try {
          var result = await dwarfContract.methods.stakeDarth(this.state.darthvalue).send({ from:accountAddress, });
          }
          catch(error) {
            store.setReady(false);
            }
    store.setReady(false);
    store.checkMarket();
    }

  componentWillMount() {
    emitter.on('balances', this.balances);
    emitter.on('nbalances', this.balances);
    emitter.on('staked', this.setstaked);
    }
  
  componentWillUnmount() {
    emitter.removeListener('balances', this.balances);
    emitter.removeListener('nbalances', this.balances);
    emitter.removeListener('staked', this.setstaked);
    }
  
  setstaked(staked) {
    const stakedDarth = store.getStore("stakedDarth");
    const stakedJedi = store.getStore("stakedJedi");
    const canClaim = store.getStore("canClaim");
    this.setState({
        staked: staked,
        stakedDarth: stakedDarth,
        stakedJedi: stakedJedi,
        canClaim: canClaim,
      });
    }

  jedihandleChange(selectedOption) { this.setState({jedivalue:selectedOption }); }
  darthhandleChange(selectedOption) { this.setState({darthvalue:selectedOption }); }

  renderJediNFTs = () => {
    const { NFTs } = this.state
    return NFTs.filter((NFT) => {
      if(NFT.side === 'jedi') {
        return true
        }
        else {
          return false
          }
      }).map((NFT) => {
        return this.renderNFT(NFT)
        })
    }

  renderDarthNFTs = () => {
    const { NFTs } = this.state
    return NFTs.filter((NFT) => {
      if(NFT.side === 'darth') {
        return true
        }
        else {
          return false
          }
      }).map((NFT) => {
        return this.renderNFT(NFT)
        })
    }
 
  renderNFT = (NFT) => {
    var goto = () => this.claimJediNFT(NFT.id);
    const { canClaim } = this.state
    if(NFT.side === 'darth') {
      goto = () => this.claimDarthNFT(NFT.id);
      }
      return (
        <div className={ appStyle.nfblock }>
          <div className={ appStyle.nfblockPower }>
            <span>Damage: { NFT.pd }</span>
            <span>Kinetics: { NFT.pk }</span>
            <span>Speed: { NFT.ps }</span>
            <span>Conversion: { NFT.pc }</span>
            <span>Healing: { NFT.ph }</span>
            <span>{ NFT.suply }/{ NFT.total }</span>
          </div>
          <div className={ appStyle.nfblockMine }>
            <span>{ NFT.amount }</span>
          </div>
          <img src={ NFT.logo } alt="" />
          <p>{ NFT.title }</p>
          <p className={ NFT.side }>{ NFT.price } <br /> DWARF</p>
            <button onClick={ goto } disabled={ !canClaim }>Claim NFT</button>
        </div>  
        )
    }
  
  async claimJediNFT(id) {
      store.setReady(true);
      const accountAddress = store.getStore("accountAddress");
      const dwarfAddress = store.getStore("dwarfAddress");
      const dwarfABI = store.getStore("dwarfABI");
      const web3 = store.getStore("web3");
      const canClaim = store.getStore("canClaim");
      const dwarfContract = new web3.eth.Contract(dwarfABI, dwarfAddress);
      try {
        var result = await dwarfContract.methods.claim(id).send({ from:accountAddress, });
        console.log(result);
        }
        catch(error) {
          store.setReady(false);
          console.log(error);
          }
      store.checkMarket();
      store.getBalances();
      store.setReady(false);
    }

  async claimDarthNFT(id) {
      store.setReady(true);
      const accountAddress = store.getStore("accountAddress");
      const dwarfAddress = store.getStore("dwarfAddress");
      const dwarfABI = store.getStore("dwarfABI");
      const web3 = store.getStore("web3");
      const canClaim = store.getStore("canClaim");
      const dwarfContract = new web3.eth.Contract(dwarfABI, dwarfAddress);
        try {
          var result = await dwarfContract.methods.claim(id).send({ from:accountAddress, });
          console.log(result);
          }
          catch(error) {
            store.setReady(false);
            console.log(error);
            }
      store.checkMarket();
      store.getBalances();
      store.setReady(false);
    }


  render() {
    const { accountAddress, jediLP, darthLP, staked, stakedDarth, stakedJedi, canClaim } = this.state;
    const options = [
      { label: "1-day", value: 1 },
      { label: "7-day", value: 7 },
      { label: "30-day", value: 30 },
      { label: "90-day", value: 90 },
      { label: "180-day", value: 180 },
      { label: "360-day", value: 360 },
      ]
    return (
      <div className={ style.Sword }>
        <Header />
        <div className={ appStyle.container }>
          {(() => {
            if (staked && stakedDarth > 0) {
              return (
                <div className={ appStyle.flexrow }>
                  {
                    !canClaim && <div>Scheduled Warfare period still not expired, cannot claim.</div>
                    }
                  {
                    this.renderDarthNFTs()
                    }
                </div>
                )
              }
              else if (staked && stakedJedi > 0) {
                return (
                  <div className={appStyle.flexrow}>
                    {
                      !canClaim && <div>Scheduled Warfare period still not expired, cannot claim.</div>
                      }
                    {
                      this.renderJediNFTs()
                      }
                  </div>
                  )
                }
                else {
                  return (
                    <div className={ appStyle.flexrow }>
                      <div className={ appStyle.nfblock }>
                        <img src="img/jedi.png" alt="JEDI Side" />
                        <p>{ jediLP } <br /> JEDI/DWARF PoLP</p>
                        <label>Select a Scheduled Warfare
                        <Select 
                          className={ style.darkTheme } 
                          options={ options }
                          value={ this.state.jedivalue }
                          onChange={ this.jedihandleChange } />
                        </label>
                        <button disabled={ jediLP===0 } onClick={ this.stakeJedi }>Stake JEDI NFTs</button>
                      </div>
                      <div className={ appStyle.nfblock }>
                        <img src="img/dart.png" alt="DARTH Side" />
                        <p>{darthLP} <br /> DARTH/DWARF PoLP</p>
                        <label>Select a Scheduled Warfare
                        <Select 
                          className={ style.darkTheme }
                          options={ options }
                          value={ this.state.darthvalue }
                          onChange={ this.darthhandleChange } />
                        </label>
                        <button disabled={ darthLP===0 } onClick={ this.stakeDarth }>Stake DARTH NFTs</button>
                      </div>
                    </div>
                    )
                  }
            }
          ())}
        </div>
        <Footer />
      </div>
      )
    }
  }

export default Collections;
