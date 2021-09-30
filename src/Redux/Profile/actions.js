import {
  CONNECT_WALLET,
  PROFILE_REQUEST,
  PROFILE_SUCCESS,
  PROFILE_FAIL,
  TEST_PROFILE_SUCCESS,
  TEST_PROFILE_FAIL,
  TEST_PROFILE_REQ,
} from './constants'
import getContracts, {ethereum, walletLink} from '../Blockchain/contracts'
import {totalTreasuryAmount} from '../Root/actions'
// Real Network

// const data = [
//   {
//     chainId: '0x89',
//     chainName: 'Polygon Mainnet',
//     nativeCurrency: {
//       name: 'MATIC',
//       symbol: 'MATIC',
//       decimals: 18,
//     },
//     rpcUrls: ['https://polygon-rpc.com/'],
//     blockExplorerUrls: ['https://www.polygonscan.com/'],
//   },
// ]

// Test Network

// const data = [
//   {
//     chainId: '0x13881',
//     chainName: 'Polygon Testnet',
//     nativeCurrency: {
//       name: 'MATIC',
//       symbol: 'MATIC',
//       decimals: 18,
//     },
//     rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
//     blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
//   },
// ]

// const data = [
//   {
//     chainId: '0x13881',
//     chainName: 'Polygon Testnet',
//     nativeCurrency: {
//       name: 'MATIC',
//       symbol: 'MATIC',
//       decimals: 18,
//     },
//     rpcUrls: ['https://matic-mumbai.chainstacklabs.com/'],
//     blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
//   },
// ]

// actions

// export const checkAndAddNetwork = () => async (dispatch) => {
//   try {
//     await window.ethereum.request({
//       method: 'wallet_switchEthereumChain',
//       params: [{chainId: data[0]?.chainId}],
//     })
//   } catch (error) {
//     console.log(error)
//     if (error?.code === 4902) {
//       try {
//         await window.ethereum.request({
//           method: 'wallet_addEthereumChain',
//           params: data,
//         })
//       } catch (addError) {
//         console.error(addError?.message)
//       }
//     }
//   }
// }

// export const checkAndAddNetworkTest = () => async (dispatch) => {
//   try {
//     await window.ethereum.request({
//       method: 'wallet_switchEthereumChain',
//       params: [{chainId: Testdata[0]?.chainId}],
//     })
//   } catch (error) {
//     console.log(error)
//     if (error?.code === 4902) {
//       try {
//         await window.ethereum.request({
//           method: 'wallet_addEthereumChain',
//           params: Testdata,
//         })
//       } catch (addError) {
//         console.error(addError?.message)
//       }
//     }
//   }
// }

export const connToMetaMask = () => async (dispatch) => {
  try {
    // dispatch(checkAndAddNetwork())
    const userAddress = await window.ethereum.request({
      method: 'eth_requestAccounts',
    })
    dispatch({
      type: CONNECT_WALLET,
      payload: userAddress[0],
      walletType: 'MetaMask',
    })
  } catch (error) {
    console.error(error?.message)
  }
}

export const connToCoinbase = () => async (dispatch) => {
  try {
    // dispatch(checkAndAddNetwork())
    const accounts = await ethereum.enable()
    // coinbaseWeb3.eth.defaultAccount = accounts[0]
    dispatch({
      type: CONNECT_WALLET,
      payload: accounts[0],
      walletType: 'Coinbase',
    })
  } catch (error) {
    console.error(error?.message)
  }
}
export const disConnectWallet = () => async () => {
  // web3.currentProvider._handleDisconnect();
  walletLink.disconnect()
}
export const getProfileInformation = () => async (dispatch, getState) => {
  try {
    const {
      profile: {userAddress, walletType},
    } = getState()
    dispatch({
      type: PROFILE_REQUEST,
    })
    const {web3, usdc, capl, cret, Staking} = getContracts(walletType)

    if (userAddress) {
      // available Balance
      const balance = await usdc.methods.balanceOf(userAddress).call()
      const availableBalance = web3.utils.fromWei(balance.toString(), 'Mwei')

      const totalRewardsEarned = 0,
        cptLPBalance = 0,
        crtLPBalance = 0

      // CPT and CRT
      const cptB = await capl.methods.balanceOf(userAddress).call()
      const cptBalance = web3.utils.fromWei(cptB.toString(), 'ether')

      const crtB = await cret.methods.balanceOf(userAddress).call()
      const crtBalance = web3.utils.fromWei(crtB.toString(), 'ether')



      dispatch({
        type: PROFILE_SUCCESS,
        payload: {
          availableBalance: Number(availableBalance),
          totalRewardsEarned,
          cptBalance: Number(cptBalance),
          crtBalance: Number(crtBalance),
          cptLPBalance,
          crtLPBalance,
        },
      })
    }
  } catch (error) {
    dispatch({
      type: PROFILE_FAIL,
      payload: error?.message,
    })
  }
}

export const getProfileInformationTest = () => async (dispatch, getState) => {
  try {
    const {
      profile: {userAddress, walletType},
    } = getState()
    dispatch({
      type: TEST_PROFILE_REQ,
    })
    const {web3, testcapl, Staking} = getContracts(walletType)

    if (userAddress) {
      // available Balance

      // CPT and CRT
      const caplB = await testcapl.methods.balanceOf(userAddress).call()
      const CAPLBalance = web3.utils.fromWei(caplB.toString(), 'ether')

      const ccptB = await Staking.methods._balancescapl(userAddress).call()
      const CCPTBalance = web3.utils.fromWei(ccptB.toString(), 'ether')

      const rew = await Staking.methods._balancesccpt(userAddress).call()
      const Rewards = web3.utils.fromWei(rew.toString(), 'ether')

      dispatch({
        type: TEST_PROFILE_SUCCESS,
        payload: {
          CAPLBalance,
          CCPTBalance,
          Rewards
        },
      })
    }
  } catch (error) {
    dispatch({
      type: TEST_PROFILE_FAIL,
      payload: error?.message,
    })
  }
}
