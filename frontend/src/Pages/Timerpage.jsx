import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import PTimer from "../components/timer.jsx";
import timer from "../assets/timer.png";

const Timerp = () => {
    return (
        <>
        <Sidebar />
        <Header title="Timer" pageIcon={timer} />
        <PTimer />
        </>
    );
};

export default Timerp;