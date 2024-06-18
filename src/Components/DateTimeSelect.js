// DateTimeSelect.js
import { useState, useEffect } from 'react';
import Datetime from 'react-datetime';
import "react-datetime/css/react-datetime.css";
import moment from 'moment';
import styles from './DateTimeSelect.module.css';

export default function DateTimeSelect({ label, name, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value ? moment(value).toDate() : new Date());

  useEffect(() => {
    if (value) {
      setSelectedDate(value);
    }
  }, [value]);

  const handleDateChange = (date) => {
    setSelectedDate(date.toDate());
  };

  const handleConfirm = () => {
    const formattedDate = moment(selectedDate).format('YYYY-MM-DD HH:mm:ss');
    onChange(formattedDate);
    setIsOpen(false);
  };

  const formattedDate = moment(selectedDate).format('YYYY-MM-DD HH:mm:ss');

  return (
    <div className={styles.datetimeContainer}>
      {label && <label htmlFor={name}>{label}</label>}
      <input
        type="text"
        readOnly
        value={formattedDate}
        onClick={() => setIsOpen(true)}
        className={styles.polarisTextfield}
        id={name}
        name={name}
      />
      {isOpen && (
        <div className={styles.datetimePickerWrapper}>
          <Datetime
            className={styles.datetimePicker}
            value={selectedDate}
            input={false}
            initialViewMode="days"
            timeFormat={true}
            onChange={handleDateChange}
            closeOnSelect={true}
          />
          <button className={styles.confirmButton} onClick={handleConfirm}>Select</button>
      
        </div>
      )}
    </div>
  );
}
