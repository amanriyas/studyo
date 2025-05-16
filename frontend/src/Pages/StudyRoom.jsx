import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import ChatBoxRoom from "../components/ChatboxRoom";
import Study_Room from "../assets/Study_Room.png";


const StudyRoom = () =>{
    return (
        <>
        <Sidebar/>
        <Header title="Study Room" pageIcon={Study_Room} />
        <ChatBoxRoom />
        </>
    )
}

export default StudyRoom;