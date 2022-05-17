import logo from './logo.svg';
import './App.css';
import Web3 from 'web3';
import {Suspense, useState, useEffect} from 'react';
import {Canvas} from '@react-three/fiber';
import {Sky, MapControls} from '@react-three/drei';
import {Physics} from '@react-three/cannon';

import Land from './abis/Land.json';
import Navbar from './components/NavBar';
import Plot from './components/Plot';
import Plane from './components/Plane';
import Building from './components/Building';
function App() {

  const [web3, setWeb3] = useState(null)
  const [account, setAccount] = useState(null)
  const [landContract, setlandContract] = useState(null)
  const [cost, setCost] = useState(null)
  const [buildings, setBuildings] = useState(null)

  const [landId, setLandId] = useState(null)
  const [landName, setLandName] = useState(null)
  const [landOwner, setLandOwner] = useState(null)
  const [hasOwner, setHasOwner] = useState(false)

  useEffect(() => {
    loadBlockchainData()
  }, [account])

  const loadBlockchainData = async () => {
    if(typeof window.ethereum !== 'undefined') {
      const web3 = new Web3(window.ethereum)
      setWeb3(web3)

      const accounts = await web3.eth.getAccounts()
      if(accounts > 0) {
        setAccount(accounts[0])
      }
      const networkId = await web3.eth.net.getId()
      const land = new web3.eth.Contract(Land.abi, Land.networks[networkId].address)
      setlandContract(land)

      const cost = await land.methods.cost().call()
      console.log(cost)
      setCost(web3.utils.fromWei(cost.toString(), 'ether'))

      const buildings = await land.methods.getBuildings().call()
      console.log(buildings)
      setBuildings(buildings)

      window.ethereum.on('accountChanged', function (accounts) {
        setAccount(accounts[0])
      })

      window.ethereum.on('chainChanged', (chainId) => {
        window.location.reload();
      })
    }
  }

  const web3Handler = async () => {
    if(web3) {
      const accounts = await window.ethereum.request({method: 'eth_requestAccounts'})
      setAccount(accounts[0])
    }
  }

  const buyHandler = async (_id) => {
		try {
			await landContract.methods.mint(_id).send({ from: account, value: '1000000000000000000' })

			const buildings = await landContract.methods.getBuildings().call()
			setBuildings(buildings)

			setLandName(buildings[_id - 1].name)
			setLandOwner(buildings[_id - 1].owner)
			setHasOwner(true)
		} catch (error) {
			window.alert('Error occurred when buying')
		}
	}

  return (
    <div>
    <Navbar web3Handler={web3Handler} account={account}/>
    <Canvas camera={{position: [0,0,30], up: [0,0,1], far: 10000}}>
      <Suspense fallback={null}>
      <Sky distance={450000} sunPosition={[1,10,0]} inclination={0} azimuth={0.25}/>
      <ambientLight intensity={0.3}/>
      <Physics>
        {buildings && buildings.map((building, index) => {
          
          if(building.owner === '0x0000000000000000000000000000000000000000'){
            console.log('qweqwe')
            console.log(building)
            return(
              <Plot
                key={index}
                position={[building.posX, building.posY, 0.1]}
                size={[building.sizeX, building.sizeY]}
                landId={index+1}
                landInfo={building}
                setLandName={setLandName}
                setLandOwner={setLandOwner}
                setHasOwner={setHasOwner}
                setLandId={setLandId}
                />
            )
          }else {
            console.log('asdasd')
            console.log(building)
            return(
              <Building
                key={index}
                position={[building.posX, building.posY, 0.1]}
                size={[building.sizeX, building.sizeY, building.sizeZ]}
                landId={index+1}
                landInfo={building}
                setLandName={setLandName}
                setLandOwner={setLandOwner}
                setHasOwner={setHasOwner}
                setLandId={setLandId}
                />
            )
          }
        })}
      </Physics>
      <Plane/>
      </Suspense>
      <MapControls />
    </Canvas>
    {landId && (
				<div className="info">
					<h1 className="flex">{landName}</h1>

					<div className='flex-left'>
						<div className='info--id'>
							<h2>ID</h2>
							<p>{landId}</p>
						</div>

						<div className='info--owner'>
							<h2>Owner</h2>
							<p>{landOwner}</p>
						</div>

						{!hasOwner && (
							<div className='info--owner'>
								<h2>Cost</h2>
								<p>{`${cost} ETH`}</p>
							</div>
						)}
					</div>

					{!hasOwner && (
						<button onClick={() => buyHandler(landId)} className='button info--buy'>Buy Property</button>
					)}
				</div>
			)}
    </div>
  );
}

export default App;
