import React, { useState } from 'react';
import MyCalendar from '../components/Calendar';
import Sidebar from '../components/Sidebar';
import Calendar from '../assets/Calendar.png';
import Header from '../components/Header';

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <>
      <Sidebar />
      <Header title="Calendar" pageIcon={Calendar}/>
      <MyCalendar selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
    </>
  )
};

export default CalendarPage;