import React, { Component, useReducer, useState } from 'react'
import Check from '../svgs/Check'
import { useWeb3React } from '@web3-react/core'
import { InjectedConnector } from '@web3-react/injected-connector'
import { LedgerConnector } from '../../connectors/ledger'

const CHAINS = [
	{
		name: 'Mainnet',
		id: 1,
	},
	{
		name: 'Ropsten',
		id: 3,
	},
	{
		name: 'Rinkeby',
		id: 4,
	},
	{
		name: 'Kovan',
		id: 42,
	},
	{
		name: 'Ganache',
		id: 1337,
	},
	{
		name: 'Ganache',
		id: 123,
	}
]

const SUPPORTED_CHAIN_IDS = [
	// Mainnet
	1,
	// Ropsten
	3,
	// Rinkeby
	4,
	// Dev chains (Ganache, Geth)
	123, // Low chainId to workaround ledgerjs signing issues.
	1337,
	// Keep testnet
	1101
]

// Connectors.
const injectedConnector = new InjectedConnector({})

const ledgerConnector = new LedgerConnector({
	// TODO: introduce CHAIN_ID and ETH_RPC_URL env variables.
    chainId: process.env.CHAIN_ID || 1377,
	url: 'ws://localhost:8545'
})

// Wallets.
const WALLETS = [
	{
		name: "Metamask",
		icon: "/images/metamask-fox.svg",
		showName: true,
		connector: injectedConnector
	},
	{
		name: "Ledger",
		icon: "/images/ledger.svg",
		connector: ledgerConnector
	},
]

export const ConnectWalletDialog = ({ shown, onConnected, onClose }) => {
	const { active, account, activate, chainId, connector } = useWeb3React()

	let [chosenWallet, setChosenWallet] = useState(null)
	let [error, setError] = useState(null)
	let state = {
		chosenWallet,
		error
	}

	async function chooseWallet(wallet, connector) {
		setChosenWallet(wallet)

		try {
			await activate(connector, undefined, true)
			onConnected()
		} catch(ex) {
			setError(ex.toString())
			throw ex
		}
	}

	const ChooseWalletStep = () => {
		return <>
			<header>
				<div className="title">Connect to a wallet</div>
			</header>
			<p>This wallet will be used to sign transactions on Ethereum.</p>

			<ul className='wallets'>
				{
					WALLETS.map(({ name, icon, showName, connector }) => {
						return <li className='wallet-option' onClick={() => chooseWallet(name, connector)}>
							<img src={icon} />
							{showName && name}
						</li>
					})
				}
			</ul>
		</>
	}

	const ConnectToWalletStep = () => {
		if(error) {
			return <ErrorConnecting/>
		}

		if(chosenWallet == 'Ledger') {
			return <>
				<header>
					<div className="title">Plug In Ledger & Enter Pin</div>
				</header>
				<p>Open Ethereum application and make sure Contract Data and Browser Support are enabled.</p>
				<p>Connecting...</p>
			</>
		}

		return <>
			<header>
				<div className="title">Connect to a wallet</div>
			</header>
			<p>Connecting to {chosenWallet} wallet...</p>
		</>
	}

	const ErrorConnecting = () => {
		return <>
			<header>
				<div className="title">Connect to a wallet</div>
			</header>
			<p>Error connecting to {chosenWallet} wallet...</p>
			<a onClick={async () => {
				setError(null)
				await chooseWallet(chosenWallet)
			}}>
				Try Again
			</a>
			{ error && <p>{error}</p> }
		</>
	}

	const ConnectedView = () => {
		return <div className='connected-view'>
			<header>
				<div className="title">Wallet connected</div>
			</header>

			<div className='details'>
				<p>Chain: {CHAINS.filter(chain => chain.id == chainId)[0].name}</p>
				<p>{chosenWallet}</p>
				<p>
					{account}
				</p>
			</div>
		</div>
	}

	return <div>
		<div className={`modal connect-wallet ${shown ? 'open' : 'closed'}`}>
			<div className="modal-body">
				<div className="close">
					<div className="x" onClick={onClose}>&#9587;</div>
				</div>
				{!chosenWallet && <ChooseWalletStep />}
				{(chosenWallet && !active) && <ConnectToWalletStep />}
				{(chosenWallet && active) && <ConnectedView />}
			</div>
		</div>
	</div>
}