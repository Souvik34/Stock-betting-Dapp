import WrongNetworkMessage from '../components/WrongNetworkMessage'
import ConnectWalletButton from '../components/ConnectWalletButton'
import TodoList from '../components/TodoList'
import {TaskContractAddress} from '../config.js'
import TaskAbi from '../../backend/build/contracts/TaskContract.json'
import {ethers} from 'ethers'
import { useState } from 'react'
import { useEffect } from 'react'



/* 
const tasks = [
  { id: 0, taskText: 'clean', isDeleted: false }, 
  { id: 1, taskText: 'food', isDeleted: false }, 
  { id: 2, taskText: 'water', isDeleted: true }
]
*/

export default function Home() {
  const [correctNetwork, setCorrectNetwork] = useState(true)  
  const[isUserLoggedIn, setIsUserLoggedIn] = useState(true)
  const[currentAccount, setCurrentAccount]= useState('')
  const [input, setInput]= useState('')
  const [tasks, setTasks] = useState([])
  
  useEffect(() => {
    connectWallet()
    getAllTasks()
  }, [])
 
  // Calls Metamask to connect wallet on clicking Connect Wallet button
  const connectWallet = async () => {
    try
    {
      const {ethereum} = window;

      if (!ethereum)
      {
        console.log("Get Metamask!");
        return;
      }

      let chainId = await ethereum.request({method: 'eth_chainId'});

      console.log("Connected", chainId);

      const sepoliaChainId = "	11155111";
      if(chainId !== sepoliaChainId)
      {
        alert("You are not connected to the Sepolia Test Network!")
        setCorrectNetwork(false);
      }
      else
      {
        setCorrrectNetwork(true);
      }
      const accounts = await ethereum.request({method: 'eth_accounts'});
      console.log("Connected", accounts[0]);
      setIsUserLoggedIn(true)
      setCurrentAccount(accounts[0])
    }
    catch(error)
    {
      console.log(error);
    }

  }

  // Just gets all the tasks from the contract
  const getAllTasks = async () => {
  try 
  {
    const {ethereum} = window
    if(ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum)
      const signer = provider.getSigner()
      const TaskContract = new ethers.Contract(TaskContractAddress, TaskAbi, signer)
      let allTasks = await TaskContract.getMytasks()
      setTasks(allTasks)
  } else
    {
      console.log("Ethereum object doesn't exist!")
    }
  }
  catch(error)
  {
    console.log(error)
  }
  }

  // Add tasks from front-end onto the blockchain
  const addTask = async e => {
  e.preventDefault();

    let task ={
      taskText: input,
      isDeleted: false
    }
    try{
      const {ethereum} = window
      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const TaskContract = new ethers.Contract(TaskContractAddress, TaskAbi, signer)

        TaskContract.addTask(task.taskTest, task.isDeleted)
        .then(res =>{
          setTasks([...tasks, task])
          console.log('Added task')
        })
        .catch(err => console.log(err))
      }
      else
      {
        console.log("Ethereum object doesn't exist!")
      }
    }
    catch (error)
    {
      console.log(error)
    }
    setInput('')
  }

  // Remove tasks from front-end by filtering it out on our "back-end" / blockchain smart contract
  const deleteTask = key => async () => {
    try{
      const {ethereum} = window
      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const TaskContract = new ethers.Contract(TaskContractAddress, TaskAbi, signer)

        const deleteTaskTx = await TaskContract.deleteTask(key, true)
          console.log('Deleted task', deleteTaskTx)

        let allTasks = await TaskContract.getMytasks()
        setTasks(allTasks)
      }
      else
      {
        console.log("Ethereum object doesn't exist!")
      }
    }
    catch (error)
    {
      console.log(error)
    }

  }

  return (
    <div className='bg-[#97b5fe] h-screen w-screen flex justify-center py-6'>
      {isUserLoggedIn ? <ConnectWalletButton 
                                    connectWallet={connectWallet}/> :
        correctNetwork ? <TodoList tasks={tasks} input={input} setInput={setInput} addTask={addTask} deleteTask={deleteTask}/> : <WrongNetworkMessage />}
    </div>
  )
}

